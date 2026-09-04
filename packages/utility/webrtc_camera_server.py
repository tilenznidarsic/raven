"""WebRTC camera test server.

Streams the local machine's webcam over WebRTC so the web app's
CameraPanel component (packages/web/src/features/camera/CameraPanel.tsx)
has something real to connect to during development.

Setup:
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

Run:
    python webrtc_camera_server.py

CameraPanel posts an SDP offer to POST /offer and expects an SDP answer
back as JSON — matching aiortc's standard signaling example.
"""

import argparse
import asyncio
import logging

import cv2
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from av import VideoFrame

pcs: set[RTCPeerConnection] = set()


class WebcamVideoTrack(VideoStreamTrack):
    def __init__(self, device_index: int = 0):
        super().__init__()
        self._capture = cv2.VideoCapture(device_index)
        if not self._capture.isOpened():
            raise RuntimeError("Could not open webcam via OpenCV")

    async def recv(self) -> VideoFrame:
        pts, time_base = await self.next_timestamp()
        ok, frame = await asyncio.to_thread(self._capture.read)
        if not ok:
            raise RuntimeError("Failed to read frame from webcam")

        video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        return video_frame


async def offer(request: web.Request) -> web.Response:
    params = await request.json()
    remote_offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        if pc.connectionState in ("failed", "closed"):
            await pc.close()
            pcs.discard(pc)

    pc.addTrack(WebcamVideoTrack())

    await pc.setRemoteDescription(remote_offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response(
        {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
    )


async def offer_options(_request: web.Request) -> web.Response:
    return web.Response()


@web.middleware
async def cors_middleware(request, handler):
    try:
        response = await handler(request)
    except web.HTTPException as exc:
        response = exc
    except Exception:
        logging.exception(
            "Unhandled error handling %s %s", request.method, request.path
        )
        response = web.json_response({"error": "internal server error"}, status=500)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


async def on_shutdown(_app: web.Application) -> None:
    await asyncio.gather(*(pc.close() for pc in pcs))
    pcs.clear()


def main() -> None:
    parser = argparse.ArgumentParser(description="WebRTC camera test server")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()

    app = web.Application(middlewares=[cors_middleware])
    app.on_shutdown.append(on_shutdown)
    app.router.add_post("/offer", offer)
    app.router.add_options("/offer", offer_options)

    web.run_app(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()

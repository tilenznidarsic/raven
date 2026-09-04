import { useEffect, useRef, useState } from 'react';
import CameraSelect from './CameraSelect';

const SIGNALING_URL = 'http://localhost:8080/offer';

type Camera = {
  id: string;
  name: string;
};

type Props = {
  cameras: Camera[];
};

function waitForIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    function checkState() {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }
    }
    pc.addEventListener('icegatheringstatechange', checkState);
  });
}

export default function CameraPanel({ cameras }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState(cameras[0]?.id ?? '');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');
  const prevFrameStatsRef = useRef<{ framesDecoded: number; timestamp: number } | null>(
    null,
  );

  useEffect(() => {
    const pc = new RTCPeerConnection();
    pc.addTransceiver('video', { direction: 'recvonly' });

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    let statsIntervalId: number | undefined;

    async function connect() {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGatheringComplete(pc);

      const localDescription = pc.localDescription;
      if (!localDescription) {
        throw new Error('Missing local description');
      }

      const response = await fetch(SIGNALING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: localDescription.sdp,
          type: localDescription.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Signaling request failed');
      }

      const answer = await response.json();
      await pc.setRemoteDescription(answer);

      statsIntervalId = window.setInterval(async () => {
        const stats = await pc.getStats();
        stats.forEach((report) => {
          if (
            report.type === 'candidate-pair' &&
            report.state === 'succeeded' &&
            typeof report.currentRoundTripTime === 'number'
          ) {
            setLatencyMs(Math.round(report.currentRoundTripTime * 1000));
          }

          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            const previous = prevFrameStatsRef.current;
            if (previous) {
              const frameDelta = report.framesDecoded - previous.framesDecoded;
              const timeDeltaSeconds =
                (report.timestamp - previous.timestamp) / 1000;
              if (timeDeltaSeconds > 0) {
                setFps(Math.round(frameDelta / timeDeltaSeconds));
              }
            }
            prevFrameStatsRef.current = {
              framesDecoded: report.framesDecoded,
              timestamp: report.timestamp,
            };
          }
        });
      }, 1000);
    }

    connect().catch(() => setError('Camera unavailable'));

    return () => {
      clearInterval(statsIntervalId);
      pc.close();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-black/85 px-4 py-1">
        <div className="flex items-center gap-3">
          <CameraSelect
            cameras={cameras}
            value={selectedCameraId}
            onChange={setSelectedCameraId}
          />
          {latencyMs !== null && (
            <span className="text-xs font-bold text-orange-300">{latencyMs} ms</span>
          )}
          {fps !== null && (
            <span className="text-xs font-bold text-orange-300">{fps} fps</span>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            setObjectFit((prev) => (prev === 'cover' ? 'contain' : 'cover'))
          }
          className="cursor-pointer text-orange-300"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
          >
            <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
          </svg>
        </button>
      </div>
      {error ? (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
          {error}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
        />
      )}
    </div>
  );
}

"""List AVFoundation video devices visible to PyAV/ffmpeg.

Run:
    python list_cameras.py

ffmpeg's avfoundation demuxer prints its device list to stderr as part
of an intentional failure when given an empty input, so the device
names/indices should show up below even though this always raises.
"""

import av
import av.logging

av.logging.set_level(av.logging.VERBOSE)

try:
    av.open("", format="avfoundation", options={"list_devices": "true"})
except av.error.FFmpegError as error:
    print(f"(expected failure while listing devices: {error})")

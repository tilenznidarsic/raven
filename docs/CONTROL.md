# Control Panels

The control page ([`/control`](../packages/web/src/pages/ControlPage.tsx)) is a grid of panels for monitoring and controlling a single drone. Each panel is a self-contained view backed by [`PanelContainer`](../packages/web/src/shared/components/PanelContainer.tsx).

- **Camera view** — lists the cameras onboard and lets the user switch between them, showing the live feed from whichever is selected. If a camera is controllable (pan/tilt/zoom), the panel shows an indicator and exposes controls for it.
- **Navigation view** — a map with a drone icon showing current position, heading, and movement. Also surfaces waypoints, the active flight plan, and autopilot state/controls.
- **Motor view** — per-motor status (RPM, temperature, health) and manual motor controls.
- **Drone controls** — auxiliary hardware controls: lights and landing gear.
- **Gyro view** — drone orientation (pitch, roll, yaw), with an optional 3D mode for visualizing attitude.
- **Flight logs** — view logs produced by the drone.

# Architecture

# Drone Platform — Microservice Architecture

Split by data ownership and update cadence, not by CRUD entity. The real-time layer is stateful and connection-heavy; domain services are normal request/response; the platform layer cuts across everything.

## Real-time layer

Stateful, connection-oriented, scales on concurrent connections rather than request volume. Deserves its own tech stack and deploy cycle.

- **Telemetry gateway** — owns websocket/MQTT connections to each drone. Handles command ack/nack, backpressure, reconnection. This is the bidirectional command/telemetry service.
- **Live air traffic** — read-side aggregator. Subscribes to the gateway's telemetry stream via pub/sub (not direct calls) and serves the fused fleet-position view to the UI. Kept separate from the gateway because fan-out to many map-watching clients scales differently than fan-in from many drones.
- **Video streaming** — separate protocol (WebRTC/RTSP vs websockets) and separate bandwidth profile from telemetry.

## Domain services

Normal CRUD / business-rule services. Scale horizontally without much fuss.

- **Mission planning** — waypoints, routes, mission templates.
- **Fleet registry** — drone inventory, hardware/firmware metadata, maintenance status. The "nouns" service other services reference by ID.
- **Airspace rules** — geofences, no-fly zones, possibly integration with external UTM/regulatory systems (e.g. FAA LAANC). Isolated because rule logic changes on its own cadence and may need audit trails.
- **Alerts** — battery thresholds, geofence breaches, lost-link events. Consumes the telemetry stream (via subscription, not direct dependency) and fans out to notification channels.
- **Simulation** — generates realistic flight telemetry from mission plans. Connects to the telemetry gateway as a virtual drone client using the same protocol real drones use, so all downstream services (air traffic, alerting, history) get exercised identically for real and simulated flights. See open questions below.

## Platform layer

Cross-cutting, used by everything above.

- **Identity & access** — users, orgs, RBAC (who can fly which drone, who can only view).
- **Flight history & analytics** — durable, queryable store of past telemetry/commands for playback, compliance, reporting. Deliberately separate from the live telemetry gateway: one optimizes for "last N seconds, low latency," the other for "months of time-series data, query-friendly."

## Cross-cutting decisions to make early

- **API gateway / BFF** in front of everything, so the web client isn't juggling direct connections to every service.
- **Command audit trail** — immutable log of who issued which command and when. Can live inside the gateway or as its own append-only service; retrofitting this later is painful.

## Simulation service — open questions

- **Identity tagging** — fleet registry needs a "simulated drone" flag so air traffic, alerts, and history can distinguish sim flights from real ones (filter in consuming services, not parallel services).
- **Time control** — sims may run faster than real-time or be paused/rewound. Keep this capability inside the simulation service; the gateway's real drone connections don't need it.
- **Fan-out load** — a large simulated swarm is real load on the gateway and air traffic aggregator. Decide whether to rate-limit simulated traffic or route it through a separate gateway instance so it can't degrade real fleet connections.
- **Command loopback** — commands sent to a simulated drone must be received and physically modeled by the simulation service (e.g. "go to waypoint" actually moves the simulated position), not just logged.
- **Primary use case** (affects design): testing/QA (lightweight, disposable sims), operator training, or pre-flight mission validation (treating simulated drones as first-class fleet entries with saved history). Worth deciding which is primary.

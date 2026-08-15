# Architecture

# Drone Platform — Architecture

Two-layer split, not a sprawl of microservices: a single **backend** owns CRUD and business logic, and a **live data layer** owns real-time device communication and streaming. The two talk over pub/sub, not direct calls, so the connection-heavy real-time work can scale and deploy independently of ordinary request/response traffic.

## Backend

One deployable, modular internally by domain. Normal request/response, scales horizontally without much fuss, persists to PostgreSQL via Prisma.

- **Mission planning** — waypoints, routes, mission templates.
- **Fleet registry** — drone inventory, hardware/firmware metadata, maintenance status. The "nouns" other domains reference by ID.
- **Airspace rules** — geofences, no-fly zones, possibly integration with external UTM/regulatory systems (e.g. FAA LAANC). Change on their own cadence and may need audit trails.
- **Alert rules** — battery thresholds, geofence-breach and lost-link definitions. The backend owns the *rules*; the live data layer evaluates them against live telemetry and raises the events.
- **Identity & access** — users, orgs, RBAC (who can fly which drone, who can only view).
- **Flight history & analytics** — durable, queryable store of past telemetry/commands/alerts for playback, compliance, reporting.
- **Command audit trail** — immutable log of who issued which command and when, built from command events the live data layer publishes.
- **Simulation scenarios** — CRUD for saved scenarios/templates. Actually *running* a sim is live-data-layer work (see below).

## Live data layer

Stateful, connection-oriented, scales on concurrent connections rather than request volume. This is where "real-time comms" lives.

- **Telemetry gateway** — owns websocket/MQTT connections to each drone. Handles command send/ack/nack, backpressure, reconnection. The bidirectional command/telemetry service.
- **Live air traffic** — read-side aggregator. Subscribes to the gateway's telemetry stream via pub/sub (not direct calls) and serves the fused fleet-position view to the UI.
- **Video streaming** — separate protocol (WebRTC/RTSP vs websockets) and separate bandwidth profile from telemetry.
- **Real-time alert evaluation** — consumes the telemetry stream, evaluates it against the alert rules the backend owns, and pushes live alert events to subscribed clients (and to the backend, for durable logging).
- **Simulation execution** — runs simulated drones as virtual clients of the telemetry gateway, using the same protocol as real drones, so every downstream consumer (air traffic, alerts, history) treats sim and real flights identically. Loads scenario definitions from the backend; owns time control (pause/rewind/fast-forward) since real drone connections never need it.

## API gateway / BFF

Single entry point for the frontend, so the client isn't juggling direct connections to every piece:

- REST/GraphQL CRUD requests → backend.
- Websocket subscriptions (live position, live alerts) → live data layer.
- Video stream negotiation → live data layer's video streaming service.

## Command flow

1. Client issues a command through the gateway.
2. Gateway routes it to the live data layer's telemetry gateway, which sends it to the drone and streams back ack/nack.
3. The telemetry gateway publishes a command event to pub/sub.
4. The backend consumes that event and writes it to the audit trail / history store.

The backend is never in the synchronous path of a live command — it only ever sees command and telemetry events asynchronously, after the fact, for persistence and reporting.

## Why split this way at all

The real-time layer's scaling axis (concurrent connections, fan-in from drones, fan-out to map-watching clients) is fundamentally different from the backend's (request volume). Keeping them as two deployables — rather than one, or ten — lets each scale and deploy on its own cadence without paying microservice-per-entity overhead for parts of the system that don't need it.

## Open questions

- **Sim identity tagging** — fleet registry needs a "simulated drone" flag so air traffic, alerts, and history can filter sim flights from real ones in the consuming logic, rather than standing up parallel services.
- **Fan-out load** — a large simulated swarm is real load on the telemetry gateway and air traffic aggregator. Decide whether to rate-limit simulated traffic or route it through a separate gateway instance so it can't degrade real fleet connections.
- **Command loopback** — commands sent to a simulated drone must be received and physically modeled by the simulation runner (e.g. "go to waypoint" actually moves the simulated position), not just logged.
- **Primary use case for simulation** (affects design) — testing/QA (lightweight, disposable sims), operator training, or pre-flight mission validation (treating simulated drones as first-class fleet entries with saved history). Worth deciding which is primary.
- **Pub/sub technology** — Redis streams, NATS, or Kafka for the backend ↔ live-data-layer event bus; pick based on required durability/replay for the audit trail vs. operational simplicity.

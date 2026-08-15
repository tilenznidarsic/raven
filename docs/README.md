Project Raven

A fullstack application for monitoring and teleoperation of remote drones.

Overview

Project Raven provides the software layer for drone operators to track fleet status and issue remote commands. It combines a backend service layer with a frontend interface for real-time monitoring and control.

Architecture

Project Raven is split into two deployables, not a sprawl of microservices:

- Backend — CRUD and business logic: mission planning, fleet registry, airspace rules, alert rules, identity & access, flight history & analytics, command audit trail, and simulation scenario CRUD. Persists to PostgreSQL through Prisma.
- Live data layer — real-time comms: the telemetry gateway (drone connections, bidirectional command/telemetry), live air traffic (fused fleet-position view), video streaming, real-time alert evaluation, and simulation execution.

A React + Vite client talks to both through a single API gateway: REST/GraphQL to the backend, websocket subscriptions and video negotiation to the live data layer. The backend and live data layer communicate over pub/sub rather than direct calls, so real-time traffic never sits in the backend's request path. See ARCHITECTURE.md for the full breakdown and open design questions.

Tech Stack

Frontend
- React — UI component library
- Vite — build tool and dev server
- TypeScript — typed application code

Backend
- Node.js — runtime for the API gateway, backend, and live data layer
- Prisma — ORM / data-access and migration layer
- Real-time transport — websocket/MQTT for the telemetry gateway; WebRTC/RTSP for video
- Pub/sub — event bus between the backend and the live data layer (telemetry, commands, alerts)

Database
- PostgreSQL — primary relational datastore

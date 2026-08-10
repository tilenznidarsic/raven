Project Raven

A fullstack application for monitoring and teleoperation of remote drones.

Overview

Project Raven provides the software layer for drone operators to track fleet status and issue remote commands. It combines a backend service layer with a frontend interface for real-time monitoring and control.

Architecture

Project Raven follows a microservice architecture, split by data ownership and update cadence into three layers:

- Real-time layer — stateful, connection-oriented services: the telemetry gateway (drone connections, bidirectional command/telemetry), live air traffic (fused fleet-position view), and video streaming.
- Domain services — request/response CRUD and business rules: mission planning, fleet registry, airspace rules, alerts, and simulation.
- Platform layer — cross-cutting services used by everything above: identity & access, flight history & analytics, and command audit trail.

A React + Vite client talks to the backend through an API gateway. Services communicate via request/response plus pub/sub for the telemetry stream, and persist state in PostgreSQL through Prisma. See ARCHITECTURE.md for the full breakdown and open design questions.

Tech Stack

Frontend
- React — UI component library
- Vite — build tool and dev server
- TypeScript — typed application code

Backend
- Node.js — runtime for the API gateway and services
- Prisma — ORM / data-access and migration layer
- Real-time transport — websocket/MQTT for the telemetry gateway; WebRTC/RTSP for video
- Pub/sub — event stream fan-out between the telemetry gateway and its consumers (air traffic, alerts, history)

Database
- PostgreSQL — primary relational datastore

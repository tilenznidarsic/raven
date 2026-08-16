# Backend conventions

- Define new routers under `routes/`, one folder per endpoint. The folder name matches the endpoint it serves — `auth/` for `/auth`. A nested router follows the same rule but lives inside its parent router's folder (e.g. a `/users/settings` router goes in `routes/users/settings/`).
- Router files should only wire things together — import the validators and controller handlers, and mount them on routes. Keep business logic out of the router file so it stays easy to scan. Document each route with a multiline comment stating the method and path.
- If a route needs request validation, apply the `validate` middleware with a schema. Always wrap the handler in `asyncHandler` so thrown/rejected errors are forwarded to the shared error handler instead of needing a try/catch in the handler.
- Write controller handlers with the `function` keyword, not arrow functions.
- Define validation schemas in `validators/`, not inline in the controller or router.
- Suffix files by role: `.router.ts`, `.controller.ts`, `.validator.ts`, `.middleware.ts`.
- Use an `index.ts` barrel for exporting from folders — `routes/`, every individual router folder (e.g. `routes/auth/index.ts` re-exporting `auth.router.ts`), `middlewares/`, and `validators/`. Other files should import from the folder, not reach into a specific file inside it.

```ts
// routes/auth/auth.router.ts — Good
import express from 'express';
import { register } from './auth.controller';
import { validate, asyncHandler } from '../../middlewares';
import { registerSchema } from '../../validators';

const router = express.Router();

/**
 * Register a new user
 * POST /auth/register
 */
router.post('/register', validate(registerSchema), asyncHandler(register));

export default router;
```

// routes/auth/auth.controller.ts — Good

```ts
import { Request, Response } from 'express';

// req.body is already validated by the `validate` middleware, and any
// thrown/rejected error is caught by `asyncHandler` — no try/catch here.
export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  // ...
}
```

```ts
// validators/auth.validator.ts — Good
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});
```

## Prisma

- Define new models under `prisma/models/`. Put each model in its own file, named after the model; a model's related enums (and similar small supporting types) can live in the same file.
- Use snake_case for field names — `created_at`, not `createdAt`.
- Never run Prisma migrations (`prisma migrate dev`, `db push`, etc.) yourself. The user runs migrations manually — only use read-only commands like `prisma validate`, `prisma format`, or `prisma generate`.

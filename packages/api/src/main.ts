import path from 'node:path';
import { config } from 'dotenv';
import express from 'express';
//import { PrismaPg } from '@prisma/adapter-pg';
//import { PrismaClient } from './generated/prisma/client.js';

config({ path: path.join(import.meta.dirname, '../.env') });

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

//const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
//const prisma = new PrismaClient({ adapter });
const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/health', async (req, res) => {
  //await prisma.$queryRaw`SELECT 1`;
  res.send({ status: 'ok' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

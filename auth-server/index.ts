import { Hono } from "hono";
import { cors } from "hono/cors";
import { betterAuth } from "better-auth";
import { serve } from "@hono/node-server";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// --- 1. DYNAMIC ORIGINS (For Vercel + Localhost) ---
const allowedOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
  })
);

// --- 2. SSL DATABASE CONNECTION (Required for Neon) ---
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: true, // 👈 CRITICAL: Neon DB will reject connections without this
});

// --- 3. BETTER AUTH CONFIG ---
export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: allowedOrigins,
  user: {
    additionalFields: {
      softwareExperience: { type: "string", required: false },
      hardwareExperience: { type: "string", required: false },
    },
  },
});

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// --- 4. DYNAMIC PORT (Required for Railway) ---
const port = Number(process.env.PORT) || 4000;

console.log(`Auth Server running on port ${port}`);

serve({
  fetch: app.fetch,
  port: port, // 👈 CRITICAL: Must use the variable, not just 4000
});
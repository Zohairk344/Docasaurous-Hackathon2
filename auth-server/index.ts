import { Hono } from "hono";
import { cors } from "hono/cors";
import { betterAuth } from "better-auth";
import { serve } from "@hono/node-server";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// --- NEW: Read allowed origins from Environment Variable ---
const allowedOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(",") 
  : ["http://localhost:3000"]; // Fallback if variable is missing

// 1. Configure CORS dynamically
app.use(
  "*",
  cors({
    origin: allowedOrigins, // <--- NOW IT USES YOUR RAILWAY VARIABLE
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
  })
);

// 2. Setup Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: true, 
});

// 3. Initialize Better Auth
export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: allowedOrigins, // <--- UPDATED HERE TOO
  user: {
    additionalFields: {
      softwareExperience: { type: "string", required: false },
      hardwareExperience: { type: "string", required: false },
    },
  },
});

// 4. Mount Auth Routes
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

console.log("Auth Server running on http://localhost:4000");
serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 4000, // Good practice to use PORT var
});
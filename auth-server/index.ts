import { Hono } from "hono";
import { cors } from "hono/cors";
import { betterAuth } from "better-auth";
import { serve } from "@hono/node-server";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// 1. Configure CORS to allow your Docusaurus frontend
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"], // Your Docusaurus URL
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
  })
);

// 2. Setup Database Connection (Same Neon DB as Python)
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL, // <--- To this
});

// 3. Initialize Better Auth
export const auth = betterAuth({ 
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000"], 
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
  port: 4000,
});
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://docasaurous-hackathon2-production.up.railway.app",
  // Add this section to fix the TypeScript error
  user: {
    additionalFields: {
      softwareExperience: {
        type: "string",
        required: false,
      },
      hardwareExperience: {
        type: "string",
        required: false,
      },
    },
  },
});
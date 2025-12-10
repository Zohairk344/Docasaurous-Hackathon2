import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:4000",
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
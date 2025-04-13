import { defineConfig } from "cypress";
import * as TestDatabase from "./server/test/utils/TestDatabase";
export default defineConfig({
  e2e: {
    specPattern: "client/test/e2e/**/*.cy.{js,ts,jsx,tsx}",
    baseUrl: "http://localhost:3000",
  },
});

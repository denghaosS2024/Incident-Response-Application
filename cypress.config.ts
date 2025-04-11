import { defineConfig } from "cypress";
import * as TestDatabase from "./server/test/utils/TestDatabase";
export default defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    setupNodeEvents(on, config) {
      on('task', {
        async connectTestDb() {
          await TestDatabase.connect();
          return null;
        },
        async closeTestDb() {
          await TestDatabase.close();
          return null;
        },
        async resetTestDb() {
          await TestDatabase.resetDatabase();
          return null;
        }
      });
      
      return config;
    },
  },
});

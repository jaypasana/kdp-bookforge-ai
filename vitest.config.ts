import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // The real "server-only" package throws unconditionally outside of
      // Next.js's webpack/Turbopack build (it relies on a resolve condition
      // Vite/Vitest doesn't set). Stub it in tests so server-only-guarded
      // modules stay importable; the guard still applies in the real build.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    pool: "threads",
    setupFiles: ["./tests/setup.ts"],
    exclude: ["node_modules", ".next", "e2e"],
  },
});

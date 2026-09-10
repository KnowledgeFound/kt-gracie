import { fileURLToPath, URL } from "url";
import { defineConfig } from "vitest/config";

export default defineConfig({
    // Mirror the aliases from vite.config.js so service tests that import the
    // generated canister declarations (e.g. `declarations/kt-gracie-backend`)
    // resolve the same way they do in the app build.
    resolve: {
        alias: [
            {
                find: "declarations",
                replacement: fileURLToPath(
                    new URL("../declarations", import.meta.url)
                ),
            },
            {
                find: "@",
                replacement: fileURLToPath(new URL("./src", import.meta.url)),
            },
        ],
    },
    test: {
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
});

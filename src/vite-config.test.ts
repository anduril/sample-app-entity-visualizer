import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/*
    Vite only exposes env vars to client code (import.meta.env) when they match
    `envPrefix`, which defaults to "VITE_". This app relies on that default
    (vite.config.ts sets no envPrefix override), so every variable that
    src/config.ts reads MUST be VITE_-prefixed — otherwise it is silently
    `undefined` in the browser. This test guards against that regression.
*/
describe("config env vars use the VITE_ prefix", () => {
    it("reads only VITE_-prefixed vars from import.meta.env", () => {
        const configPath = fileURLToPath(new URL("./config.ts", import.meta.url));
        const source = readFileSync(configPath, "utf8");

        const referenced = [...source.matchAll(/import\.meta\.env\.(\w+)/g)].map((m) => m[1]);

        expect(referenced.length).toBeGreaterThan(0);
        for (const name of referenced) {
            expect(name.startsWith("VITE_"), `${name} must start with VITE_`).toBe(true);
        }
    });
});

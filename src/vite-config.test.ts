import { describe, it, expect } from "vitest";
import configFn from "../vite.config";

/*
    Vite only exposes env vars to client code (import.meta.env) when they match
    `envPrefix`, which defaults to "VITE_". Since this app reads unprefixed
    LATTICE_* variables in src/config.ts, the vite config MUST widen envPrefix
    to include "LATTICE_", otherwise every value is `undefined` at runtime.
*/
describe("vite config env prefix", () => {
    it("exposes LATTICE_-prefixed env vars to client code", () => {
        // defineConfig receives a function; call it the way Vite does.
        const config = (configFn as unknown as (env: { mode: string; command: string }) => {
            envPrefix?: string | string[];
        })({ mode: "development", command: "serve" });

        const prefixes = Array.isArray(config.envPrefix)
            ? config.envPrefix
            : [config.envPrefix];

        expect(prefixes).toContain("LATTICE_");
    });
});

import { describe, it, expect } from "vitest";
import { resolveAuthConfig, type AuthInputs } from "./auth";

describe("resolveAuthConfig", () => {
    it("selects bearer-token auth when only BEARER_TOKEN is set", () => {
        const result = resolveAuthConfig({ BEARER_TOKEN: "my-token" });
        expect(result).toEqual({ mode: "bearer", token: "my-token" });
    });

    it("selects client-credentials auth when only CLIENT_ID and CLIENT_SECRET are set", () => {
        const result = resolveAuthConfig({ CLIENT_ID: "id", CLIENT_SECRET: "secret" });
        expect(result).toEqual({ mode: "client_credentials" });
    });

    it("throws when both bearer token and client credentials are set", () => {
        expect(() =>
            resolveAuthConfig({ BEARER_TOKEN: "t", CLIENT_ID: "id", CLIENT_SECRET: "secret" }),
        ).toThrow(/cannot be used together/i);
    });

    it("throws when a bearer token is combined with only a client id", () => {
        expect(() => resolveAuthConfig({ BEARER_TOKEN: "t", CLIENT_ID: "id" })).toThrow(
            /cannot be used together/i,
        );
    });

    it("throws a helpful error when no credentials are configured", () => {
        expect(() => resolveAuthConfig({})).toThrow(/no authentication/i);
    });

    it("throws when client credentials are incomplete (id without secret)", () => {
        expect(() => resolveAuthConfig({ CLIENT_ID: "id" })).toThrow(
            /VITE_LATTICE_CLIENT_SECRET/,
        );
    });

    /*
        The banner shows these messages verbatim, so they have to name the
        `VITE_`-prefixed variables. Vite does not expose unprefixed vars to the
        browser, so an unprefixed name in an error would misdirect the reader.
    */
    it("names only VITE_-prefixed environment variables in error messages", () => {
        const failures: AuthInputs[] = [
            {},
            { CLIENT_ID: "id" },
            { CLIENT_SECRET: "secret" },
            { BEARER_TOKEN: "t", CLIENT_ID: "id" },
            { BEARER_TOKEN: "t", CLIENT_ID: "id", CLIENT_SECRET: "secret" },
        ];

        for (const input of failures) {
            let message = "";
            expect(() => {
                try {
                    resolveAuthConfig(input);
                } catch (e) {
                    message = (e as Error).message;
                    throw e;
                }
            }).toThrow();

            const named = message.match(/\b[A-Z][A-Z0-9_]{3,}\b/g) ?? [];
            expect(named.length).toBeGreaterThan(0);
            for (const name of named) {
                expect(name, `error for ${JSON.stringify(input)}: ${message}`).toMatch(
                    /^VITE_LATTICE_/,
                );
            }
        }
    });
});

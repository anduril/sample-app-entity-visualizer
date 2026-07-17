import { describe, it, expect } from "vitest";
import { resolveAuthConfig } from "./auth";

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
        expect(() => resolveAuthConfig({ CLIENT_ID: "id" })).toThrow(/CLIENT_SECRET/);
    });
});

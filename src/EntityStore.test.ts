import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/*
    These tests exercise EntityStore's authentication wiring. We stub the
    config module and the connect transport so no real network calls happen,
    then assert on the headers EntityStore sends to streamEntityComponents.
*/

// Mutable config the mock below reads from, so each test can set its own creds.
const mockConfig: Record<string, string | undefined> = {};

vi.mock("./config", () => ({
    get APPLICATION_CONFIG() {
        return mockConfig;
    },
}));

// Capture the arguments EntityStore passes to the streaming RPC.
const streamCalls: unknown[][] = [];

vi.mock("@connectrpc/connect", () => ({
    createCallbackClient: () => ({
        streamEntityComponents: (...args: unknown[]) => {
            streamCalls.push(args);
            return () => {};
        },
    }),
}));

vi.mock("@connectrpc/connect-web", () => ({
    createGrpcWebTransport: () => ({}),
}));

async function importFreshStore() {
    vi.resetModules();
    const mod = await import("./EntityStore");
    return mod.EntityStore;
}

// Pull the Headers object out of the recorded streamEntityComponents call.
function headersFromLastStreamCall(): Headers {
    const args = streamCalls.at(-1)!;
    const options = args.at(-1) as { headers: Headers };
    return options.headers;
}

describe("EntityStore authentication", () => {
    beforeEach(() => {
        for (const key of Object.keys(mockConfig)) delete mockConfig[key];
        streamCalls.length = 0;
        mockConfig.LATTICE_URL = "https://lattice.example.com";
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("uses the static bearer token directly without hitting the OAuth endpoint", async () => {
        const fetchSpy = vi.fn();
        vi.stubGlobal("fetch", fetchSpy);
        mockConfig.BEARER_TOKEN = "static-token";

        const EntityStore = await importFreshStore();
        new EntityStore();
        await vi.waitFor(() => expect(streamCalls.length).toBe(1));

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(headersFromLastStreamCall().get("authorization")).toBe("Bearer static-token");
    });

    it("exchanges client credentials at the OAuth endpoint and streams with the access token", async () => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ access_token: "exchanged-token", expires_in: 900 }),
        });
        vi.stubGlobal("fetch", fetchSpy);
        mockConfig.CLIENT_ID = "id";
        mockConfig.CLIENT_SECRET = "secret";

        const EntityStore = await importFreshStore();
        new EntityStore();
        await vi.waitFor(() => expect(streamCalls.length).toBe(1));

        expect(fetchSpy).toHaveBeenCalledOnce();
        const [url] = fetchSpy.mock.calls[0];
        expect(url).toContain("/api/v1/oauth/token");
        expect(headersFromLastStreamCall().get("authorization")).toBe("Bearer exchanged-token");
    });

    it("fails loudly and never streams when no credentials are configured", async () => {
        vi.stubGlobal("fetch", vi.fn());

        const EntityStore = await importFreshStore();
        expect(() => new EntityStore()).toThrow(/no authentication/i);
        expect(streamCalls.length).toBe(0);
    });
});

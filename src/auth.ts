/*
    Auth-method resolution for connecting to a Lattice environment.

    Lattice supports two mutually-exclusive ways to authenticate (see
    https://developer.anduril.com/guides/getting-started/authenticate):

      - Bearer token: a long-lived, static token passed directly on every
        request. No token exchange happens.
      - Client credentials: a client id + secret exchanged at the OAuth
        endpoint for short-lived access tokens that must be refreshed.

    This function validates the configured credentials up front and reports a
    clear error, rather than failing deep inside the request path.
*/

export interface AuthInputs {
    BEARER_TOKEN?: string;
    CLIENT_ID?: string;
    CLIENT_SECRET?: string;
}

export type AuthConfig =
    | { mode: "bearer"; token: string }
    | { mode: "client_credentials" };

const AUTH_DOCS = "https://developer.anduril.com/guides/getting-started/authenticate";

/*
    Error messages name the environment variables a user actually has to set,
    not the keys of `AuthInputs`. Vite only exposes `VITE_`-prefixed vars to the
    browser, so an error telling someone to set `BEARER_TOKEN` would send them
    to a variable the app can never read.
*/
const ENV_VAR: Record<keyof AuthInputs, string> = {
    BEARER_TOKEN: "VITE_LATTICE_BEARER_TOKEN",
    CLIENT_ID: "VITE_LATTICE_CLIENT_ID",
    CLIENT_SECRET: "VITE_LATTICE_CLIENT_SECRET",
};

export function resolveAuthConfig(config: AuthInputs): AuthConfig {
    const hasBearer = Boolean(config.BEARER_TOKEN);
    const hasClientId = Boolean(config.CLIENT_ID);
    const hasClientSecret = Boolean(config.CLIENT_SECRET);

    if (hasBearer && (hasClientId || hasClientSecret)) {
        throw new Error(
            `Bearer token auth (\`${ENV_VAR.BEARER_TOKEN}\`) and client credentials auth ` +
                `(\`${ENV_VAR.CLIENT_ID}\` + \`${ENV_VAR.CLIENT_SECRET}\`) cannot be used together. ` +
                `Use only one method of authentication. Learn more at ${AUTH_DOCS}`,
        );
    }

    if (hasBearer) {
        return { mode: "bearer", token: config.BEARER_TOKEN! };
    }

    if (hasClientId || hasClientSecret) {
        if (!hasClientId || !hasClientSecret) {
            throw new Error(
                `Client credentials auth requires both \`${ENV_VAR.CLIENT_ID}\` and ` +
                    `\`${ENV_VAR.CLIENT_SECRET}\`. Learn more at ${AUTH_DOCS}`,
            );
        }
        return { mode: "client_credentials" };
    }

    throw new Error(
        `No authentication configured. Set \`${ENV_VAR.BEARER_TOKEN}\`, or ` +
            `\`${ENV_VAR.CLIENT_ID}\` and \`${ENV_VAR.CLIENT_SECRET}\`. ` +
            `Learn more at ${AUTH_DOCS}`,
    );
}

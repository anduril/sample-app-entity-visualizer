import { EntityManagerAPI, EventType, StreamEntityComponentsResponse } from "@buf/anduril_lattice-sdk.bufbuild_es/anduril/entitymanager/v1/entity_manager_grpcapi.pub_pb";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { CallbackClient, createCallbackClient } from "@connectrpc/connect";
import { Entity } from "@buf/anduril_lattice-sdk.bufbuild_es/anduril/entitymanager/v1/entity.pub_pb";
import { APPLICATION_CONFIG } from "./config";

export class EntityStore {

    private connection : CallbackClient<typeof EntityManagerAPI>;
    private entities : Map<string, Entity>;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;
    private refreshTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        this.connection = createCallbackClient(EntityManagerAPI, createGrpcWebTransport({
            baseUrl: APPLICATION_CONFIG.LATTICE_URL,
        }));
        this.entities = new Map();
        this.getAccessToken().then(() => {
            this.streamEntities();
        }).catch(error => {
            console.error("Failed to get access token:", error);
        });
    }

    private async getAccessToken(retryCount: number = 0): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const tokenEndpoint = `${APPLICATION_CONFIG.LATTICE_URL}/api/v1/oauth/token`;

            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'client_id': APPLICATION_CONFIG.CLIENT_ID,
                    'client_secret': APPLICATION_CONFIG.CLIENT_SECRET,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;

            const expirySeconds = data.expires_in || 900;
            this.tokenExpiry = Date.now() + (expirySeconds * 1000);

            this.scheduleTokenRefresh();

            return this.accessToken ? this.accessToken : "";
        } catch (error) {
            console.error(`Error obtaining access token (attempt ${retryCount + 1}):`, error);

            const maxRetries = 3;
            if (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
                console.log(`Retrying in ${delay}ms...`);

                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(this.getAccessToken(retryCount + 1));
                    }, delay);
                });
            }

            throw error;
        }
    }

    private scheduleTokenRefresh(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        const timeToRefresh = Math.max(0, this.tokenExpiry - Date.now() - 60000);

        this.refreshTimer = setTimeout(async () => {
            console.log("Refreshing token before expiration");
            try {
                await this.getAccessToken();
            } catch (error) {
                console.error("Failed to refresh token:", error);
            }
        }, timeToRefresh);
    }

    private async streamEntities() {
        try {
            const headers = new Headers();

            // Get fresh access token
            const token = await this.getAccessToken();
            headers.set("authorization", `Bearer ${token}`);
            headers.set("anduril-sandbox-authorization", `Bearer ${APPLICATION_CONFIG.SANDBOX_TOKEN}`);

            /*
                Stream all entities, asking for all components to be set. Please visit
                https://docs.anduril.com/guide/entity/watch#stream-entities for additional information
                on streaming entities
            */
            this.connection.streamEntityComponents({ includeAllComponents: true},
                // Success callback
                (res : StreamEntityComponentsResponse) => {
                    const entity = res.entityEvent?.entity;

                    if (!entity?.entityId) {
                        return;
                    }

                    // We replace the entity in the map if it's one of the following types and delete it if it's expired.
                    switch (res.entityEvent?.eventType) {
                        case EventType.PREEXISTING:
                        case EventType.CREATED:
                        case EventType.UPDATE:
                                this.entities.set(entity.entityId, entity);
                                break;

                        case EventType.DELETED:
                            this.entities.delete(entity.entityId);
                    }
                },

                async (err) => {
                    console.error("Stream error:", err);

                    const authErrors = [
                        "unauthorized", "authentication failed", "invalid token",
                        "expired token", "token expired", "forbidden", "access denied"
                    ];

                    const errorMessage = err?.message?.toLowerCase() || '';
                    const isAuthError = authErrors.some(phrase => errorMessage.includes(phrase));

                    if (isAuthError) {
                        console.log("Authentication error detected, refreshing token and reconnecting...");
                        this.tokenExpiry = 0;

                        setTimeout(() => {
                            this.getAccessToken()
                                .then(() => this.streamEntities())
                                .catch(error => console.error("Failed to reconnect:", error));
                        }, 60000); 
                    }
                },
                { headers: headers }
            );
        } catch (error) {
            console.error("Error in streamEntities:", error);

            setTimeout(() => {
                console.log("Retrying streamEntities...");
                this.streamEntities();
            }, 5000);
        }
    }

    getAllEntities() {
        return this.entities;
    }

}

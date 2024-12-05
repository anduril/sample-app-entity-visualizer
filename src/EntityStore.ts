import { EntityManagerAPI, EventType, StreamEntityComponentsResponse } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity_manager_grpcapi.pub_pb";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { CallbackClient, createCallbackClient } from "@connectrpc/connect";
import { Entity } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity.pub_pb";

export class EntityStore {

    private connection : CallbackClient<typeof EntityManagerAPI>;
    private baseUrl = "https://lonestar.anduril.com";
    private entities : Map<string, Entity>;

    constructor() {
        this.connection = createCallbackClient(EntityManagerAPI, createGrpcWebTransport({
            baseUrl: this.baseUrl,
        }));
        
        const headers = new Headers();
        headers.set("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MzM4ODA1MjYsImlzcyI6ImFuZHVyaWwiLCJqdGkiOiIzYTZmMWNlMC02OWJkLTQzYjMtOThkNi0yNGI4YTkxY2IyMGIiLCJuYmYiOjE3MzMyNzU3MTYsInN1YiI6InVzZXIvOWY5NjVlNGMtMzNjNi00ZTAwLThlOWEtYzdmZDUwNTc3OGU1In0.Cxj4cBP2rXbKl_M42BFZQD_rJU8k9xpEL2Od3JiB0no");

        this.entities = new Map();

        this.connection.streamEntityComponents({ includeAllComponents: true}, (res : StreamEntityComponentsResponse) => {
            const entity = res.entityEvent?.entity;

            if (!entity?.entityId) {
                return;
            }

            switch (res.entityEvent?.eventType) {
                case EventType.PREEXISTING || EventType.CREATED || EventType.UPDATE:
                    this.entities.set(entity.entityId, entity);
                    break;
                
                case EventType.DELETED:
                    this.entities.delete(entity.entityId);
            }
        }, (err) => {
            console.error(err);
        }, { headers: headers });
    }

    getAllEntities() {
        return this.entities;
    }

}
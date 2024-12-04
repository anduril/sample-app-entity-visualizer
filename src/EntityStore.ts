import { EntityManagerAPI, EventType, StreamEntityComponentsResponse } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity_manager_grpcapi.pub_pb";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { CallbackClient, createCallbackClient } from "@connectrpc/connect";
import { Entity } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity.pub_pb";

const BEARER_TOKEN = "";
const BASE_URL = "";
export class EntityStore {

    private connection : CallbackClient<typeof EntityManagerAPI>;
    private entities : Map<string, Entity>;

    constructor() {
        if (!BASE_URL || !BEARER_TOKEN) {
            throw new Error("Error starting application, base url or bearer token not set");
        }

        this.connection = createCallbackClient(EntityManagerAPI, createGrpcWebTransport({
            baseUrl: BASE_URL,
        }));     
        this.entities = new Map();
        this.streamEntities();
    }

    private streamEntities() {
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${BEARER_TOKEN}`);

        /*  
            Stream all entities, asking for all components to be set. Please visit 
            https://docs.anduril.com/guide/entity/watch#stream-entities for additional information
            on streaming entities
        */
        this.connection.streamEntityComponents({ includeAllComponents: true}, (res : StreamEntityComponentsResponse) => {
            const entity = res.entityEvent?.entity;

            if (!entity?.entityId) {
                return;
            }

            // We replace the entity in the map if it's one of the following types and delete it if it's expired.
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
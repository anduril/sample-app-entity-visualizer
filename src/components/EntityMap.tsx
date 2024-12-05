import { LatLng } from "leaflet";
import { Entity } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity.pub_pb";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
interface EntityMapProps {
  entities: Entity[];
}

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const CALIFORNIA = new LatLng(33.6939, -117.9171);

export function EntityMap({ entities }: EntityMapProps) {
  return (
    <MapContainer
      center={CALIFORNIA}
      zoom={5}
      scrollWheelZoom={true}
      className="map"
    >
      <TileLayer
        attribution={TILE_ATTRIBUTION}
        className="basemap"
        maxZoom={19}
        url={TILE_URL}
      />
      <MarkerClusterGroup chunkedLoading>
        {entities.map((entity) => {
          if (
            entity.location?.position?.latitudeDegrees &&
            entity.location?.position?.longitudeDegrees
          ) {
            return (
              <Marker
                key={entity.entityId}
                position={[
                  entity.location?.position?.latitudeDegrees,
                  entity.location?.position?.longitudeDegrees,
                ]}
              >
                <Tooltip>
                  <span>{entity.aliases?.name ?? entity.entityId}</span>
                </Tooltip>
              </Marker>
            );
          }
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

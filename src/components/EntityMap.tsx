import { LatLng } from "leaflet";
import { Entity } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity.pub_pb";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";

export interface EntityMapProps {
  entities: (Entity)[];
}

export function EntityMap(props : EntityMapProps) {
  const andurilHQ = new LatLng(33.69397524285892, -117.91718202729238)

  return (
        <MapContainer
          center={andurilHQ}
          zoom={7}
          scrollWheelZoom={true}
          className="map"
        >
          <TileLayer
            attribution="Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community"
            className="basemap"
            maxNativeZoom={19}
            maxZoom={19}
            subdomains={["clarity"]}
            url="https://{s}.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />    
          <MarkerClusterGroup key={Date.now()}>
            {props.entities.map(entity => {
              if (entity.location?.position?.latitudeDegrees && entity.location?.position?.longitudeDegrees) { 
                <Marker key={entity.entityId} position={[entity.location?.position?.latitudeDegrees, entity.location?.position?.longitudeDegrees]} />
              }
            })}
          </MarkerClusterGroup>

        </MapContainer>
  )
}
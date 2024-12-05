import "./App.css";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css"

import { EntityStore } from "./EntityStore";

import { Entity } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity.pub_pb";
import { useEffect, useState } from "react";
import { EntityMap } from "./components/EntityMap";

function App() {
  const [entities, setEntities] = useState<Entity[]>([])

  useEffect(() => {
    const store = new EntityStore()

    //Implementing the setInterval method
    const interval = setInterval(() => {
      setEntities([...store.getAllEntities().values()]);
    }, 10000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [entities]);

  return (
    <EntityMap entities={entities} />
  );
}

export default App;

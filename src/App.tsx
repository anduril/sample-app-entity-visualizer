import "./App.css";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";

import { EntityStore } from "./EntityStore";

// import { Entity } from "@anduril-industries/lattice-sdk/src/anduril/entitymanager/v1/entity.pub_pb";
import { Entity } from "@anduril-industries/api/types/Entity";
import { useEffect, useState } from "react";
import { EntityMap } from "./components/EntityMap";
import { Box, Container, Typography } from "@mui/material";
import { DownloadLink } from "./components/DownloadLink";

function App() {
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    const store = new EntityStore();

    //Implementing the setInterval method
    const interval = setInterval(() => {
      setEntities([...store.getAllEntities().values()]);
    }, 5000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="xl">
      <Box>
        <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
          Entity Map Visualization Tool
        </Typography>
        <EntityMap entities={entities} />
        <DownloadLink />
      </Box>
    </Container>
  );
}

export default App;

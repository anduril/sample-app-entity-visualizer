import "./App.css";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";

import { EntityStore } from "./EntityStore";

import { Entity } from "@buf/anduril_lattice-sdk.bufbuild_es/anduril/entitymanager/v1/entity.pub_pb";
import { useEffect, useState } from "react";
import { EntityMap } from "./components/EntityMap";
import { Alert, Box, Container, Typography } from "@mui/material";
import { DownloadLink } from "./components/DownloadLink";

function App() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const store = new EntityStore();

    // Surface a config/connection error immediately, then keep both the
    // entities and any error in sync on an interval.
    setError(store.getError());

    const interval = setInterval(() => {
      setEntities([...store.getAllEntities().values()]);
      setError(store.getError());
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <EntityMap entities={entities} />
        <DownloadLink />
      </Box>
    </Container>
  );
}

export default App;

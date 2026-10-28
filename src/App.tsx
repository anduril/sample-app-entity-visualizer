import "./App.css";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";

import { EntityStore } from "./EntityStore";
import { resolveAuthConfig } from "./auth";
import { APPLICATION_CONFIG } from "./config";

import { Entity } from "@buf/anduril_lattice-sdk.bufbuild_es/anduril/entitymanager/v1/entity.pub_pb";
import { useEffect, useState } from "react";
import { EntityMap } from "./components/EntityMap";
import { Alert, Box, Container, Typography } from "@mui/material";
import { DownloadLink } from "./components/DownloadLink";

function configError(): string | null {
  try {
    resolveAuthConfig(APPLICATION_CONFIG);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

function App() {
  const [entities, setEntities] = useState<Entity[]>([]);
  // Config errors show on first render; connection errors arrive with the interval.
  const [error, setError] = useState<string | null>(configError);

  useEffect(() => {
    const store = new EntityStore();

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

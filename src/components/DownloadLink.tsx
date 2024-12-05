import { Link, Typography } from "@mui/material";
import { GitHub } from "@mui/icons-material";

export function DownloadLink() {
    return (
        <Typography sx={{ mt: 3, mb: 3, color: "text.secondary" }}>
        <GitHub sx={{ mr: 1, verticalAlign: "middle" }} />
        {"View source code on "}
        <Link href="https://github.com/anduril/sample-app-entity-visualizer">
          GitHub
        </Link>
      </Typography>
    )
}
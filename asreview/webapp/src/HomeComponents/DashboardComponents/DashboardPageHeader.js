import { Box, Paper, Typography, Stack } from "@mui/material";

import { projectModes } from "globals.js";

import NewProjectButton from "./NewProjectButton";
import ImportProject from "ProjectComponents/ImportProject";

export default function DashboardPageHeader({ mode }) {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{ p: 2, pt: 5, m: 2, bgcolor: "background.default" }}
      >
        <Stack direction="column" justifyContent="center" alignItems="center">
          <Typography
            variant="h3"
            sx={{
              // textAlign: "center",
              // fontWeight: "bold",
              fontFamily: "Roboto Serif",
              mb: 2,
            }}
          >
            {mode === projectModes.ORACLE && "The power of AI,"}
            {mode === projectModes.SIMULATION && "The power of AI & expert,"}
          </Typography>

          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              // fontWeight: "bold",
              fontFamily: "Roboto Serif",
              mb: 8,
            }}
          >
            {mode === projectModes.ORACLE && "the expertise of you"}
            {mode === projectModes.SIMULATION && "fully automatic"}
          </Typography>

          <Stack direction="row" spacing={2}>
            <NewProjectButton mode={mode} />
            <ImportProject />
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

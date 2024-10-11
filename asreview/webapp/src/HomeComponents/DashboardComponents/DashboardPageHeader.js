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
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={7}
        >
          <Typography variant="h4">
            {mode === projectModes.ORACLE && "What do you read today?"}
            {mode === projectModes.SIMULATION &&
              "Simulate a review, fully automated"}
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

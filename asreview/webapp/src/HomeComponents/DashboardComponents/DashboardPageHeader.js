import { Stack, Typography } from "@mui/material";

import { projectModes } from "globals.js";

export default function DashboardPageHeader({ mode }) {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ p: 2, pt: 4, m: 1 }}
    >
      <Typography
        variant="h4"
        sx={{
          fontFamily: "Roboto Serif",
          mb: 2,
        }}
      >
        {mode === projectModes.ORACLE && "The power of AI,"}
        {mode === projectModes.SIMULATION && "Simulate AI & expert"}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontFamily: "Roboto Serif",
          mb: 4,
        }}
      >
        {mode === projectModes.ORACLE && "the expertise of you"}
        {/* {mode === projectModes.SIMULATION && "fully automatic"} */}
      </Typography>
    </Stack>
  );
}

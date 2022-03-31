import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function SavingStateBox(props) {
  const [state, setState] = React.useState(false);

  React.useEffect(() => {
    if (props.isSaving) {
      setState(true);
    } else {
      setTimeout(() => {
        setState(false);
      }, 1000);
    }
  }, [props.isSaving]);

  React.useEffect(() => {
    return () => {
      setState(false);
    };
  }, []);

  return (
    <Box
      sx={{
        bgcolor: (theme) => {
          if (theme.palette.mode === "dark") {
            return "#282828";
          } else {
            return "rgba(0, 0, 0, 0.06)";
          }
        },
        pl: 1,
        pr: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
        {!state ? "Saved" : "Saving..."}
      </Typography>
    </Box>
  );
}

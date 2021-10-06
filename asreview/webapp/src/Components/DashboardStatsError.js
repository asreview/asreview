import React from "react";
import { useQueryClient } from "react-query";
import { Backdrop, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  borderRadius: 16,
  flexDirection: "column",
  marginTop: theme.spacing(2),
  position: "absolute",
  zIndex: 1,
  ...(theme.palette.mode === "light" && {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  }),
  ...(theme.palette.mode === "dark" && {
    backgroundColor: "rgba(18, 18, 18, 0.8)",
  }),
}));

export default function DashboardStatsError(props) {
  const queryClient = useQueryClient();
  const resetQuery = () => {
    queryClient.resetQueries("fetchDashboardStats");
  };

  return (
    <StyledBackdrop open={props.isError}>
      <Typography variant="h6" align="center" sx={{ color: "text.secondary" }}>
        {props.error ? props.error.message : null}
      </Typography>
      <Button variant="outlined" onClick={resetQuery}>
        Try to Refresh
      </Button>
    </StyledBackdrop>
  );
}

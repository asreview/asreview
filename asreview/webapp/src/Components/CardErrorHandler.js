import React from "react";
import { useQueryClient } from "react-query";
import { Backdrop, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  borderRadius: 16,
  flexDirection: "column",
  position: "absolute",
  zIndex: 1,
  ...theme.applyStyles("light", {
    bgcolor: "rgba(255, 255, 255, 0.8)",
  }),
  ...theme.applyStyles("dark", {
    bgcolor: "rgba(18, 18, 18, 0.8)",
  }),
}));

export default function CardErrorHandler(props) {
  const queryClient = useQueryClient();
  const resetQuery = () => {
    queryClient.resetQueries(props.queryKey);
  };

  return (
    <StyledBackdrop open={props.isError}>
      <Typography align="center" sx={{ color: "text.secondary" }}>
        {props.error ? props.error.message : null}
      </Typography>
      <Button variant="outlined" onClick={resetQuery}>
        Try to Refresh
      </Button>
    </StyledBackdrop>
  );
}

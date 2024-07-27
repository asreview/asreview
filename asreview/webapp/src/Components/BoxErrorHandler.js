import * as React from "react";
import { useQueryClient } from "react-query";
import { Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 48,
}));

export default function BoxErrorHandler(props) {
  const queryClient = useQueryClient();
  const resetQuery = () => {
    queryClient.resetQueries(props.queryKey);
  };

  return (
    <Root>
      <Typography align="center" sx={{ color: "text.secondary" }}>
        {props.error?.message}
      </Typography>
      <Button variant="contained" onClick={resetQuery}>
        Try to Refresh
      </Button>
    </Root>
  );
}

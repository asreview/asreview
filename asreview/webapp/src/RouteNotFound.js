import { Box, Button, Fade, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ElasPotter from "./images/ElasPotter.svg";

const RouteNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      aria-label="route not found"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Fade in>
        <Stack
          spacing={3}
          sx={{
            alignItems: "center",
            height: "inherit",
            justifyContent: "center",
          }}
        >
          <img src={ElasPotter} alt="ElasPotter" style={{ width: "240px" }} />
          <Stack spacing={3} sx={{ alignItems: "center" }}>
            <Typography variant="h5">
              Whoops! You have come to an unexplored land named 404
            </Typography>
            <Button onClick={() => navigate("/reviews")}>Take me back</Button>
          </Stack>
        </Stack>
      </Fade>
    </Box>
  );
};

export default RouteNotFound;

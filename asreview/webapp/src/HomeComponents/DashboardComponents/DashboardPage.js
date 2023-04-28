import React from "react";
import { Box, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

const Root = styled("div")(({ theme }) => ({}));

const DashboardPage = (props) => {

  return (
    <Root aria-label="projects page">
      <Fade in>
        <Box>
          {props.children}
        </Box>
      </Fade>
    </Root>
  );
};

export default DashboardPage;

import React from "react";
import { styled } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const PREFIX = "OpenInNewIconStyled";

const classes = {
  root: `${PREFIX}-root`,
};

const StyledOpenInNewIcon = styled(OpenInNewIcon)(() => ({
  [`&.${classes.root}`]: {
    display: "inline-flex",
    alignSelf: "center",
    top: ".125em",
    position: "relative",
  },
}));

const OpenInNewIconStyled = () => {
  return (
    <StyledOpenInNewIcon
      className={classes.root}
      color="disabled"
      fontSize="small"
    />
  );
};

export default OpenInNewIconStyled;

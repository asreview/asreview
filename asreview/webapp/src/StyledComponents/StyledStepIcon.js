import * as React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

const StyledStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
  display: "flex",
  height: 22,
  alignItems: "center",
  ...(ownerState.active && {
    color: theme.palette.primary.main,
  }),
  "& .StyledStepIcon-root": {
    border: "4px solid",
    color: theme.palette.primary.main,
  },
  "& .StyledStepIcon-activeIcon": {
    width: 12,
    height: 12,
  },
  "& .StyledStepIcon-circle": {
    width: 8,
    height: 8,
    margin: "4px",
  },
}));

export function StyledStepIcon(props) {
  const { active, className } = props;

  return (
    <StyledStepIconRoot ownerState={{ active }} className={className}>
      {active ? (
        <div className="StyledStepIcon-root StyledStepIcon-activeIcon" />
      ) : (
        <div className="StyledStepIcon-root StyledStepIcon-circle" />
      )}
    </StyledStepIconRoot>
  );
}

StyledStepIcon.propTypes = {
  /**
   * Whether this step is active.
   * @default false
   */
  active: PropTypes.bool,
  className: PropTypes.string,
};

import React from "react";
import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";

const getInitials = (name) => {
  if (!name) return "?";
  const nameParts = name.split(" ");
  if (nameParts.length > 1) {
    return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
  } else {
    return nameParts[0].charAt(0).toUpperCase();
  }
};

const InitialsAvatar = styled(
  React.forwardRef((props, ref) => {
    const { name, sx, ...other } = props;
    return (
      <Avatar
        ref={ref}
        sx={{
          width: "32px",
          height: "32px",
          bgcolor: "tertiary.main",
          fontSize: "0.8rem",
          // color: "tertiary.contrastText",
          ...sx,
        }}
        {...other}
      >
        {getInitials(name)}
      </Avatar>
    );
  }),
)({});

export { InitialsAvatar };

import React from "react";
import { Divider, Typography } from "@mui/material";

const SectionHeader = ({
  icon: Icon,
  title,
  dividerSx = { mb: 2 },
  showIcon = true,
  ...props
}) => {
  return (
    <Divider sx={dividerSx} {...props}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "Roboto Serif",
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {showIcon && Icon && <Icon fontSize="small" />}
        {title}
      </Typography>
    </Divider>
  );
};

export default SectionHeader;

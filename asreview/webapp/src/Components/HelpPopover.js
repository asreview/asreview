import React from "react";
import { IconButton, Popover, Box } from "@mui/material";

import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const HelpPopover = ({ children, maxWidth = 375 }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <StyledLightBulb fontSize="small" />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              maxWidth,
            },
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>{children}</Box>
      </Popover>
    </>
  );
};

export default HelpPopover;

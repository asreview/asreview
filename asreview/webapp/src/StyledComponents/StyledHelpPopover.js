import { Box, Popover } from "@mui/material";

export function StyledHelpPopover(props) {
  return (
    <Popover {...props}>
      <Box sx={{ p: 2, maxWidth: 600 }}>{props.children}</Box>
    </Popover>
  );
}

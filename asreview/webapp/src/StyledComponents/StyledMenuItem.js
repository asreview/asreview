import { MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  cursor: "default",
  [`:hover`]: {
    bgcolor: "transparent",
  },
}));

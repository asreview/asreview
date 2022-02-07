import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`:hover`]: {
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
  },
}));

import { Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { LoadingButton } from "@mui/lab";

export const StyledTextButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  [`:hover`]: {
    bgcolor: "transparent",
  },
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`:hover`]: {
    bgcolor: "transparent",
    color: theme.palette.text.primary,
  },
}));

export const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`:hover`]: {
    bgcolor: "transparent",
    color: theme.palette.text.primary,
  },
}));

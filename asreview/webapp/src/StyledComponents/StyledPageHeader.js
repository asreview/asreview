import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const PageHeader = styled(Typography)(({ theme }) => ({
  // padding: theme.spacing(3),
  fontSize: theme.typography.h5.fontSize,
}));

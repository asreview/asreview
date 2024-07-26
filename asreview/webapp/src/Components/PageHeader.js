import * as React from "react";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const HeaderTypography = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export default function PageHeader({ header }) {
  return <HeaderTypography variant="h5">{header}</HeaderTypography>;
}

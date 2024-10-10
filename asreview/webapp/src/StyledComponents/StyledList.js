import { List } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledList = styled(List)(({ theme }) => ({
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
}));

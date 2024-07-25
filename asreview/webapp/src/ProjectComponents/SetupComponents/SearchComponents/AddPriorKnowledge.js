import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMediaQuery, useTheme } from "@mui/material";

import { PriorSearch } from ".";

const StyledDialog = styled(Dialog)(() => ({
  height: "100%",
  overflowY: "hidden",
}));

const AddPriorKnowledge = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });

  return (
    <StyledDialog
      hideBackdrop
      open={open}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: "100%" },
      }}
      TransitionComponent={Fade}
      onClose={onClose}
    >
      <DialogTitle>Search prior knowledge</DialogTitle>
      <DialogContent>
        <PriorSearch />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Return</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AddPriorKnowledge;

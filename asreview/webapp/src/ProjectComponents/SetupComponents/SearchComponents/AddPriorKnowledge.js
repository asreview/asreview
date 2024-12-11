import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { PriorSearch } from ".";

const StyledDialog = styled(Dialog)(() => ({
  height: "100%",
  overflowY: "hidden",
}));

const AddPriorKnowledge = ({ open, onClose, mobileScreen }) => {
  return (
    <StyledDialog
      hideBackdrop
      open={open}
      fullScreen={mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !mobileScreen ? "calc(100% - 64px)" : "100%" },
      }}
      TransitionComponent={Fade}
      onClose={onClose}
    >
      <DialogTitle>Search and label prior knowledge</DialogTitle>
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

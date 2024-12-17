import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { PriorSearch } from ".";

const StyledDialog = styled(Dialog)(() => ({
  height: "100%",
  overflowY: "hidden",
}));

const AddPriorKnowledge = ({ open, onClose }) => {
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <StyledDialog
      hideBackdrop
      open={open}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: fullScreen ? "100%" : "calc(100% - 64px)" },
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

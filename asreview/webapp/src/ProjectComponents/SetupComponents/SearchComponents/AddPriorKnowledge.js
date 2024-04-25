import * as React from "react";
import { useQuery } from "react-query";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { PriorSearch } from ".";
import { ProjectAPI } from "api";
import { useContext } from "react";
import { ProjectContext } from "ProjectContext";

const StyledDialog = styled(Dialog)(({ theme }) => ({
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

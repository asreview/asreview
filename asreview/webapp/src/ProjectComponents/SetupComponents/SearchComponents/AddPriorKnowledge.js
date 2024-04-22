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

const AddPriorKnowledge = ({ open, toggleAddPrior, mobileScreen }) => {
  const project_id = useContext(ProjectContext);

  const { data } = useQuery(
    ["fetchLabeledStats", { project_id: project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      enabled: open && project_id !== null,
      refetchOnWindowFocus: false,
    },
  );

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
    >
      <DialogTitle>Search prior knowledge</DialogTitle>
      <DialogContent>
        <PriorSearch n_prior={data?.n_prior} />
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleAddPrior}>Return</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AddPriorKnowledge;

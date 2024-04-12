import * as React from "react";
import { useQuery } from "react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Fade,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

import { AppBarWithinDialog } from "Components";
import { PriorLabeled, PriorRandom, PriorSearch } from ".";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";
import { useContext } from "react";
import { ProjectContext } from "ProjectContext";

const PREFIX = "AddPriorKnowledge";

const classes = {
  form: `${PREFIX}-form`,
  layout: `${PREFIX}-layout`,
  method: `${PREFIX}-method`,
  unlabeled: `${PREFIX}-unlabeled`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  height: "100%",
  overflowY: "hidden",
  [`& .${classes.form}`]: {
    height: "inherit",
    display: "flex",
    overflowY: "hidden",
    padding: 0,
  },

  [`& .${classes.layout}`]: {
    width: "100%",
    flexDirection: "row",
    [`${theme.breakpoints.down("md")} and (orientation: portrait)`]: {
      flexDirection: "column",
    },
  },

  [`& .${classes.method}`]: {
    padding: "24px 32px",
    [theme.breakpoints.down("md")]: {
      padding: "24px",
    },
  },

  [`& .${classes.unlabeled}`]: {
    backgroundColor: "transparent",
    height: "100%",
    width: "50%",
    [`${theme.breakpoints.down("md")} and (orientation: portrait)`]: {
      height: "50%",
      width: "100%",
    },
  },
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
        sx: { height: !mobileScreen ? "calc(100% - 96px)" : "100%" },
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

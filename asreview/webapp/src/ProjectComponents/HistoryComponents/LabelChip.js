import * as React from "react";
import { useQueryClient } from "react-query";
import { connect } from "react-redux";

import { Chip, Stack } from "@mui/material";

import { mapStateToProps } from "../../globals.js";

const LabelChip = (props) => {
  const queryClient = useQueryClient();

  // For Project in Setup ONLY
  const labeled = queryClient.getQueryData([
    "fetchLabeledStats",
    { project_id: props.project_id },
  ]);

  const handleClickRelevant = () => {
    props.setLabel("relevant");
  };

  const handleClickIrrelevant = () => {
    props.setLabel("irrelevant");
  };

  const handleClickAll = () => {
    props.setLabel("all");
  };

  return (
    <Stack direction="row" spacing={2} sx={{ padding: "8px 24px" }}>
      <Chip
        label={
          !labeled?.n_prior_inclusions
            ? "Relevant"
            : `Relevant (${labeled?.n_prior_inclusions})`
        }
        color="primary"
        variant={props.label === "relevant" ? "filled" : "outlined"}
        onClick={handleClickRelevant}
        size={!props.mobileScreen ? "medium" : "small"}
      />
      <Chip
        label={
          !labeled?.n_prior_exclusions
            ? "Irrelevant"
            : `Irrelevant (${labeled?.n_prior_exclusions})`
        }
        color="primary"
        variant={props.label === "irrelevant" ? "filled" : "outlined"}
        onClick={handleClickIrrelevant}
        size={!props.mobileScreen ? "medium" : "small"}
      />
      <Chip
        label={"All"}
        color="primary"
        variant={props.label === "all" ? "filled" : "outlined"}
        onClick={handleClickAll}
        size={!props.mobileScreen ? "medium" : "small"}
      />
    </Stack>
  );
};

export default connect(mapStateToProps)(LabelChip);

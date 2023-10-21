import * as React from "react";

import { Chip, Stack } from "@mui/material";

const LabelChip = (props) => {
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
          !props.priorLabeledStats?.n_prior_inclusions
            ? "Relevant"
            : `Relevant (${props.priorLabeledStats?.n_prior_inclusions})`
        }
        color="primary"
        variant={props.label === "relevant" ? "filled" : "outlined"}
        onClick={handleClickRelevant}
        size={!props.mobileScreen ? "medium" : "small"}
      />
      <Chip
        label={
          !props.priorLabeledStats?.n_prior_exclusions
            ? "Irrelevant"
            : `Irrelevant (${props.priorLabeledStats?.n_prior_exclusions})`
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

export default LabelChip;

import * as React from "react";
import { Chip, Stack } from "@mui/material";

export default function LabelChip(props) {
  const handleClickRelevant = () => {
    props.setLabel("relevant");
  };

  const handleClickIrrelevant = () => {
    props.setLabel("irrelevant");
  };

  return (
    <Stack direction="row" spacing={2} sx={{ padding: "8px 24px" }}>
      <Chip
        label={
          !props.n_prior_inclusions
            ? "Relevant"
            : `Relevant (${props.n_prior_inclusions})`
        }
        color="primary"
        variant={props.label === "relevant" ? "filled" : "outlined"}
        onClick={handleClickRelevant}
        size={!props.mobileScreen ? "medium" : "small"}
      />
      <Chip
        label={
          !props.n_prior_exclusions
            ? "Irrelevant"
            : `Irrelevant (${props.n_prior_exclusions})`
        }
        color="primary"
        variant={props.label === "irrelevant" ? "filled" : "outlined"}
        onClick={handleClickIrrelevant}
        size={!props.mobileScreen ? "medium" : "small"}
      />
    </Stack>
  );
}

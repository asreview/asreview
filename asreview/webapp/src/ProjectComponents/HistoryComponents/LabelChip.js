import * as React from "react";

import { Chip, Stack } from "@mui/material";

const LabelChip = (props) => {
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
        onClick={() => {
          props.setLabel("relevant");
        }}
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
        onClick={() => {
          props.setLabel("irrelevant");
        }}
        size={!props.mobileScreen ? "medium" : "small"}
      />
      <Chip
        label={"All"}
        color="primary"
        variant={props.label === "all" ? "filled" : "outlined"}
        onClick={() => {
          props.setLabel("all");
        }}
        size={!props.mobileScreen ? "medium" : "small"}
      />
    </Stack>
  );
};

export default LabelChip;

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
          !props.n_inclusions ? "Relevant" : `Relevant (${props.n_inclusions})`
        }
        color="primary"
        variant={props.label === "relevant" ? "filled" : "outlined"}
        onClick={handleClickRelevant}
      />
      <Chip
        label={
          !props.n_exclusions
            ? "Irrelevant"
            : `Irrelevant (${props.n_exclusions})`
        }
        color="primary"
        variant={props.label === "irrelevant" ? "filled" : "outlined"}
        onClick={handleClickIrrelevant}
      />
    </Stack>
  );
}

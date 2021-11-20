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
    <Stack direction="row" spacing={2} sx={{ padding: "16px 24px 8px 24px" }}>
      <Chip
        label="Relevant"
        color="primary"
        variant={props.label === "relevant" ? "filled" : "outlined"}
        onClick={handleClickRelevant}
      />
      <Chip
        label="Irrelevant"
        color="primary"
        variant={props.label === "irrelevant" ? "filled" : "outlined"}
        onClick={handleClickIrrelevant}
      />
    </Stack>
  );
}

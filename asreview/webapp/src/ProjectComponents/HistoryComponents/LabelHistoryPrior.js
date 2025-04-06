import { Chip, Stack, Toolbar } from "@mui/material";
import * as React from "react";

import { LabeledRecord } from ".";

const LabelHistoryPrior = ({
  project_id,
  mode = "oracle",
  n_prior_inclusions = null,
  n_prior_exclusions = null,
}) => {
  const [label, setLabel] = React.useState("relevant");

  return (
    <>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={2}>
          <Chip
            label={
              !n_prior_inclusions
                ? "Relevant"
                : `Relevant (${n_prior_inclusions})`
            }
            color="primary"
            variant={label !== "relevant" ? "outlined" : "filled"}
            onClick={() => {
              setLabel("relevant");
            }}
          />
          <Chip
            label={
              !n_prior_exclusions
                ? "Not relevant"
                : `Not relevant (${n_prior_exclusions})`
            }
            color="primary"
            variant={label !== "irrelevant" ? "outlined" : "filled"}
            onClick={() => {
              setLabel("irrelevant");
            }}
          />
          <Chip
            label={"All labeled"}
            color="primary"
            variant={label !== "all" ? "outlined" : "filled"}
            onClick={() => {
              setLabel("all");
            }}
          />
        </Stack>
      </Toolbar>
      <LabeledRecord
        project_id={project_id}
        mode={mode}
        label={label}
        filterQuery={[{ value: "is_prior", label: "Prior knowledge" }]}
      />
    </>
  );
};

export default LabelHistoryPrior;

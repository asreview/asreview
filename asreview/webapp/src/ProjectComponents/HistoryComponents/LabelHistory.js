import { Chip, Divider, Stack } from "@mui/material";
import * as React from "react";

import { Filter, LabeledRecord } from ".";

const LabelHistory = ({
  project_id,
  n_prior_inclusions = null,
  n_prior_exclusions = null,
  showFilter = true,
  filterQuery = [],
}) => {
  const [label, setLabel] = React.useState("relevant");
  const [state, setState] = React.useState(filterQuery);

  return (
    <>
      <>
        <Stack direction="row" spacing={2} sx={{ p: "1rem" }}>
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
                ? "Irrelevant"
                : `Irrelevant (${n_prior_exclusions})`
            }
            color="primary"
            variant={label !== "irrelevant" ? "outlined" : "filled"}
            onClick={() => {
              setLabel("irrelevant");
            }}
          />
          <Chip
            label={"All"}
            color="primary"
            variant={label !== "all" ? "outlined" : "filled"}
            onClick={() => {
              setLabel("all");
            }}
          />
        </Stack>

        <Divider />
        {showFilter && (
          <>
            <Filter filterQuery={state} setFilterQuery={setState} />
            <Divider />
          </>
        )}
      </>
      <LabeledRecord
        project_id={project_id}
        label={label}
        filterQuery={state}
      />
    </>
  );
};

export default LabelHistory;

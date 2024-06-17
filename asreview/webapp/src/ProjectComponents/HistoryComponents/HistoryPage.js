import { Box, Chip, Divider, Fade, Stack } from "@mui/material";
import * as React from "react";

import { PageHeader } from "Components";
import { Filter, LabeledRecord } from "../HistoryComponents";

const HistoryPage = ({
  mobileScreen,
  project_id,
  isSimulating,
  mode,
  n_prior_inclusions = null,
  n_prior_exclusions = null,
}) => {
  const [label, setLabel] = React.useState("relevant");
  const [filterQuery, setFilterQuery] = React.useState([]);

  return (
    <Fade in>
      <Box>
        <PageHeader header="History" mobileScreen={mobileScreen} />
        <Box>
          <Stack direction="row" spacing={2} sx={{ p: "1rem" }}>
            <Chip
              label={
                !n_prior_inclusions
                  ? "Relevant"
                  : `Relevant (${n_prior_inclusions})`
              }
              color="primary"
              variant={label !== "relevant" && "outlined"}
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
              variant={label !== "irrelevant" && "outlined"}
              onClick={() => {
                setLabel("irrelevant");
              }}
            />
            <Chip
              label={"All"}
              color="primary"
              variant={label !== "all" && "outlined"}
              onClick={() => {
                setLabel("all");
              }}
            />
          </Stack>

          <Divider />
          <Filter
            mobileScreen={mobileScreen}
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
          />
          <Divider />
        </Box>
        <LabeledRecord
          project_id={project_id}
          label={label}
          filterQuery={filterQuery}
          isSimulating={isSimulating}
          mode={mode}
        />
      </Box>
    </Fade>
  );
};

export default HistoryPage;

import React, { useState } from "react";
import { connect } from "react-redux";
import { useMutation, useQueryClient } from "react-query";
import { Box, Chip, Divider, Fade, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

import { Filter, LabeledRecord } from "../HistoryComponents";

import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const PREFIX = "HistoryPage";

const classes = {
  labelChip: `${PREFIX}-label-chip`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  overflowY: "hidden",
  [`& .${classes.labelChip}`]: {
    padding: "16px 24px 8px 24px",
  },

  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
    padding: 64,
  },
}));

const HistoryPage = (props) => {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("relevant");

  const { mutate } = useMutation(ProjectAPI.mutateClassification, {
    onSuccess: (data, variables) => {
      // update cached data
      queryClient.setQueryData(
        [
          label === "relevant"
            ? "fetchRelevantLabeledRecord"
            : "fetchIrrelevantLabeledRecord",
          {
            project_id: props.project_id,
            select: label === "relevant" ? "included" : "excluded",
          },
        ],
        (prev) => {
          return {
            ...prev,
            pages: prev.pages.map((page) => {
              return {
                ...page,
                result: page.result.map((value) => {
                  return {
                    ...value,
                    included:
                      value.id === variables.doc_id
                        ? value.included === 1
                          ? 0
                          : 1
                        : value.included,
                  };
                }),
              };
            }),
          };
        }
      );
    },
  });

  const handleClickRelevant = () => {
    setLabel("relevant");
  };

  const handleClickIrrelevant = () => {
    setLabel("irrelevant");
  };

  return (
    <Root aria-label="history page">
      <Fade in>
        <Box>
          <Stack className={classes.labelChip} direction="row" spacing={2}>
            <Chip
              label="Relevant"
              color="primary"
              variant={label === "relevant" ? "filled" : "outlined"}
              onClick={handleClickRelevant}
            />
            <Chip
              label="Irrelevant"
              color="primary"
              variant={label === "irrelevant" ? "filled" : "outlined"}
              onClick={handleClickIrrelevant}
            />
          </Stack>
          <Divider />
          <Filter />
          <Divider />
        </Box>
      </Fade>
      <LabeledRecord label={label} mutateClassification={mutate} />
    </Root>
  );
};

export default connect(mapStateToProps)(HistoryPage);

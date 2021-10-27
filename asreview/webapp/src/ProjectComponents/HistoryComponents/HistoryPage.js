import React, { useState } from "react";
import { connect } from "react-redux";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { Chip, Divider, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

import { Filter, LabeledRecord } from "../HistoryComponents";

import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const PREFIX = "HistoryPage";

const classes = {
  labelChip: `${PREFIX}-label-chip`,
};

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  overflowY: "hidden",
  [`& .${classes.labelChip}`]: {
    padding: "16px 24px 8px 24px",
  },
}));

const HistoryPage = (props) => {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("relevant");

  const relevantQuery = useInfiniteQuery(
    [
      "fetchRelevantLabeledRecord",
      {
        project_id: props.project_id,
        select: "included",
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

  const irrelevantQuery = useInfiniteQuery(
    [
      "fetchIrrelevantLabeledRecord",
      {
        project_id: props.project_id,
        select: "excluded",
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

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
      {label === "relevant" && (
        <LabeledRecord query={relevantQuery} mutateClassification={mutate} />
      )}
      {label === "irrelevant" && (
        <LabeledRecord query={irrelevantQuery} mutateClassification={mutate} />
      )}
    </Root>
  );
};

export default connect(mapStateToProps)(HistoryPage);

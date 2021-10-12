import React, { useState } from "react";
import { connect } from "react-redux";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import PropTypes from "prop-types";
import { Box, Divider, Tab, Tabs } from "@mui/material";

import { LabeledRecord } from "../HistoryComponents";

import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const DEFAULT_SELECTION = 0;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const HistoryPage = (props) => {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState(DEFAULT_SELECTION);

  const allQuery = useInfiniteQuery(
    [
      "fetchAllLabeledRecord",
      {
        project_id: props.project_id,
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

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
          tab === DEFAULT_SELECTION
            ? "fetchAllLabeledRecord"
            : tab === 1
            ? "fetchRelevantLabeledRecord"
            : "fetchIrrelevantLabeledRecord",
          {
            project_id: props.project_id,
            select:
              tab === DEFAULT_SELECTION
                ? undefined
                : tab === 1
                ? "included"
                : "excluded",
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

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box aria-label="history page">
      <Tabs
        value={tab}
        onChange={handleTabChange}
        aria-label="history selection"
      >
        <Tab label="All" {...a11yProps(0)} />
        <Tab label="Relevant" {...a11yProps(1)} />
        <Tab label="Irrelevant" {...a11yProps(2)} />
      </Tabs>
      <Divider />
      <TabPanel value={tab} index={0}>
        <LabeledRecord query={allQuery} mutateClassification={mutate} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <LabeledRecord query={relevantQuery} mutateClassification={mutate} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <LabeledRecord query={irrelevantQuery} mutateClassification={mutate} />
      </TabPanel>

      {/* Error handler to be added */}
    </Box>
  );
};

export default connect(mapStateToProps)(HistoryPage);

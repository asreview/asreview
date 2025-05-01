import React from "react";
import { useMutation, useQuery } from "react-query";

import {
  Box,
  Grid2 as Grid,
  Stack,
  Typography,
  IconButton,
  Popover,
  Button,
  Alert,
  Tabs,
  Tab,
  Link,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import {
  MedicalServicesOutlined,
  PsychologyAltOutlined,
  DeveloperBoardOutlined,
  EmojiNatureOutlined,
} from "@mui/icons-material";

import { ProjectAPI } from "api";
import { EntryPointDataset } from ".";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const DatasetFromEntryPoint = ({ subset, setSetupProjectId, mode }) => {
  const { data } = useQuery(
    ["fetchDatasets", { subset: subset }],
    ProjectAPI.fetchDatasets,
    { refetchOnWindowFocus: false },
  );

  const { isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.createProject,
    {
      mutationKey: ["addDataset"],
      onSuccess: (data) => {
        setSetupProjectId(data.id);
      },
    },
  );

  const [selectedTab, setSelectedTab] = React.useState(0);

  const [anchorElInfo, setAnchorElInfo] = React.useState(null);
  const handleHelpPopoverOpen = (event) => {
    setAnchorElInfo(event.currentTarget);
  };
  const handleHelpPopoverClose = () => {
    setAnchorElInfo(null);
  };
  const openInfo = Boolean(anchorElInfo);

  const getPopoverIconColor = (topic) => {
    switch (topic) {
      case "Psychology":
        return "secondary.main";
      case "Medicine":
        return "tertiary.main";
      case "Computer science":
        return "#8BAAFF";
      case "Biology":
        return "#9B6E96";
      default:
        return "grey.500";
    }
  };

  const handleTabChange = (event, newValue) => {
    if (newValue !== datasetGroups.length) {
      setSelectedTab(newValue);
    }
  };

  const addFile = (dataset_id) => {
    if (subset === "plugin") {
      mutate({
        mode: mode,
        extension: dataset_id,
      });
    } else {
      mutate({
        mode: mode,
        benchmark: dataset_id,
      });
    }
  };

  const datasetGroups = data?.result || [];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontFamily="Roboto Serif">
          Systematic Review Datasets
        </Typography>
        <IconButton size="small" onClick={handleHelpPopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
        <Popover
          open={openInfo}
          anchorEl={anchorElInfo}
          onClose={handleHelpPopoverClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                maxWidth: 375,
              },
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5} alignItems="flex-start">
              <Typography variant="subtitle1" fontWeight="bold">
                Systematic Review Datasets
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "justify" }}>
                Benchmark datasets like SYNERGY help evaluate and compare
                ASReview's screening performance. Use them to test different
                models or settings before starting your own review
              </Typography>
              <Alert severity="info">
                You can find and import more dataset collections or create your
                own plugins
              </Alert>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 3 }}
                >
                  SYNERGY Dataset Topics
                </Typography>
                <Stack spacing={1}>
                  {[
                    { topic: "Medicine", Icon: MedicalServicesOutlined },
                    { topic: "Psychology", Icon: PsychologyAltOutlined },
                    { topic: "Computer science", Icon: DeveloperBoardOutlined },
                    { topic: "Biology", Icon: EmojiNatureOutlined },
                  ].map(({ topic, Icon }) => (
                    <Box
                      key={topic}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          bgcolor: getPopoverIconColor(topic),
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 1,
                        }}
                      >
                        <Icon sx={{ color: "black" }} />
                      </Box>
                      <Typography variant="body2">{topic}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
              <Button
                href="https://asreview.ai/synergy"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Learn more
              </Button>
            </Stack>
          </Box>
        </Popover>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          {datasetGroups.map((group, index) => (
            <Tab
              key={group.group_id}
              label={group.description}
              id={`dataset-tab-${index}`}
            />
          ))}
          <Tab
            key="add-dataset-button-tab"
            component={Link}
            href="https://asreview.readthedocs.io/en/latest/reference.html#module-asreview.data"
            target="_blank"
            rel="noopener noreferrer"
            icon={
              <IconButton size="small">
                <Add fontSize="small" />
              </IconButton>
            }
            sx={{ p: 1, minWidth: "auto" }}
            value={datasetGroups.length}
          />
        </Tabs>
      </Box>

      <Box sx={{ pt: 3 }}>
        {datasetGroups.map((group, index) => (
          <Box
            key={group.group_id}
            role="tabpanel"
            hidden={selectedTab !== index}
            id={`dataset-tabpanel-${index}`}
          >
            {selectedTab === index && (
              <Grid container spacing={2} columns={6}>
                {group.datasets.map((dataset) => (
                  <Grid
                    size={{ xs: 6, sm: 3, md: 2 }}
                    key={group.group_id + ":" + dataset.dataset_id}
                  >
                    <EntryPointDataset
                      addFile={addFile}
                      dataset={dataset}
                      dataset_id={group.group_id + ":" + dataset.dataset_id}
                      subset={subset}
                      isAddingDataset={isLoading}
                      isAddingDatasetError={isError}
                      reset={reset}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DatasetFromEntryPoint;

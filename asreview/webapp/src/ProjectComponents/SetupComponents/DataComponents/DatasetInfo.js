import * as React from "react";
import { useQuery, useMutation } from "react-query";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { ProjectAPI } from "api";

import { styled, useTheme } from "@mui/material/styles";

import Chart from "react-apexcharts";

import { projectModes } from "globals.js";
import DatasetChart from "ProjectComponents/AnalyticsComponents/DatasetChart";

const classes = {};

const Root = styled("div")(({ theme }) => ({}));

const DatasetInfo = ({ project_id, dataset_path, setDataset }, props) => {
  console.log("render state");
  const {
    data,
    error: fetchDataError,
    isError: isFetchDataError,
    isFetching: isFetchingData,
  } = useQuery(
    ["fetchData", { project_id: project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: deleteProject } = useMutation(
    ProjectAPI.mutateDeleteProject,
    {
      mutationKey: ["mutateDeleteProject"],
      onSuccess: () => {
        setDataset(null);
      },
    }
  );

  const n_english = data?.n_rows * 0.3;

  return (
    <Root>
      <Card
        elevation={3}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        }}
      >
        <CardContent>
          <Box
            className={classes.cardOverlay}
            sx={{
              bgcolor: "transparent",
            }}
          />
          <Stack spacing={2}>
            <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Dataset filename
              </Typography>
              <Typography variant="body2">{dataset_path}</Typography>
            </Stack>

            <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Records
              </Typography>
              <Typography variant="body2">{data?.n_rows}</Typography>
            </Stack>

            <Box style={{ display: "flex", justifyContent: "space-evenly" }}>
              <DatasetChart
                label={"Unique records"}
                part={
                  data?.n_rows - data?.n_duplicates
                }
                total={data?.n_rows}
              />

              <DatasetChart
                label={"Available titles"}
                part={data?.n_rows - data?.n_missing_title}
                total={data?.n_rows}
              />
            </Box>

            <Box style={{ display: "flex", justifyContent: "space-evenly" }}>
              <DatasetChart
                label={"Available abstracts"}
                part={data?.n_rows - data?.n_missing_abstract}
                total={data?.n_rows}
              />

              <DatasetChart
                label={"English language"}
                part={n_english}
                total={data?.n_rows}
              />
            </Box>
          </Stack>

          {isFetchingData && (
            <Box className="main-page-body-wrapper">
              <CircularProgress />
            </Box>
          )}
          <CardErrorHandler
            queryKey={"fetchData"}
            error={fetchDataError}
            isError={isFetchDataError}
          />

          <Button
            sx={{ m: 2, display: "inline", float: "right" }}
            color="warning"
            onClick={() => {
              deleteProject({ project_id: project_id });
            }}
          >
            Change dataset
          </Button>
        </CardContent>
      </Card>
    </Root>
  );
};

export default DatasetInfo;

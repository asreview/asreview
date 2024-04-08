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

  console.log("render state")
  const progressQuery = useQuery(
    // data,
    // error: fetchDataError,
    // isError: isFetchDataError,
    // isFetching: isFetchingData,
  // } = useQuery(
    ["fetchData", { project_id: project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: deleteProject } = useMutation(
    ProjectAPI.mutateDeleteProject,
    {
      mutationKey: ["mutateDeleteProject"],
      onSuccess: () => {
        setDataset(null);
      },
    },
  );

  const n_english = 30;

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
              <Typography variant="body2">{progressQuery.data?.n_rows}</Typography>
            </Stack>

            <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Duplicates
              </Typography>
              <Typography variant="body2">
                About {progressQuery.data?.n_duplicates} ({(Math.round((progressQuery.data?.n_duplicates/progressQuery.data?.n_rows*100)*100)/100).toFixed(2)}%)
              </Typography>
              </Stack>

              <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Missing titles
              </Typography>
              <Typography variant="body2">
                {progressQuery.data?.n_missing_title}
              </Typography>
              </Stack>

              <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Missing abstracts
              </Typography>
              <Typography variant="body2">
                {progressQuery.data?.n_missing_abstract}
              </Typography>
              </Stack>

        {/* <Box style={{display: 'flex', justifyContent: 'space-between'}}> */}
        <Box style={{display: 'flex', justifyContent: 'space-between'}}>
        <DatasetChart 
        isSimulating={props.isSimulating}
        mobileScreen={props.mobileScreen}
        mode={props.mode}
        progressQuery={progressQuery}
        labels={["Unique", "Duplicate"]}
        part={progressQuery.data?.n_rows-progressQuery.data?.n_duplicates}
        total={progressQuery.data?.n_rows}
        />

        <DatasetChart 
        isSimulating={props.isSimulating}
        mobileScreen={props.mobileScreen}
        mode={props.mode}
        progressQuery={progressQuery}
        labels={["Has title", "No title"]}
        part={progressQuery.data?.n_rows-progressQuery.data?.n_missing_title}
        total={progressQuery.data?.n_rows}
        />

        <DatasetChart 
        isSimulating={props.isSimulating}
        mobileScreen={props.mobileScreen}
        mode={props.mode}
        progressQuery={progressQuery}
        labels={["Has abstract", "No abstract"]}
        part={progressQuery.data?.n_rows-progressQuery.data?.n_missing_abstract}
        total={progressQuery.data?.n_rows}
        />  

        <DatasetChart 
        isSimulating={props.isSimulating}
        mobileScreen={props.mobileScreen}
        mode={props.mode}
        progressQuery={progressQuery}
        labels={["English", "Non English"]}
        part={n_english}
        total={progressQuery.data?.n_rows}
        />

        </Box>


          </Stack>

          {progressQuery.isFetchingData && (
            <Box className="main-page-body-wrapper">
              <CircularProgress />
            </Box>
          )}
          <CardErrorHandler
            queryKey={"fetchData"}
            error={progressQuery.fetchDataError}
            isError={progressQuery.isFetchDataError}
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
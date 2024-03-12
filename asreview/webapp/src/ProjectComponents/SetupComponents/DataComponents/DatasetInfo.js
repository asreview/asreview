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

import { styled } from "@mui/material/styles";

// import {Chart, PieController, ArcElement, Tooltip, Legend} from "chart.js"
// Chart.register(PieController, ArcElement, Tooltip, Legend);

const classes = {};

const Root = styled("div")(({ theme }) => ({}));

const DatasetInfo = ({ project_id, dataset_path, setDataset }) => {
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

  // React.useEffect(() => {
  //   const chart_data = {
  //     labels: ['Duplicates', 'Unique records'],
  //     datasets: [{
  //     // data: [data?.n_duplicates, data?.n_rows-data?.n_duplicates],
  //     data: [50, 50],
  //     backgroundColor: ['#FF6384', '#FFCE56'],
  //     hoverBackgroundColor: ['#FF6384', '#FFCE56'],
  //     }],
  //   };
  
  //   const config = {
  //     type: 'pie',
  //     data: chart_data,
  //     options: {
  //       plugins: {
  //         legend: true,
  //         tooltip: false,
  //       },
  //     },
  //   };
  
  //   // Create the chart
  //   const myPieChart = new Chart(document.getElementById('duplicates_chart'), config);
  // }, []);



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

            <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Duplicates
              </Typography>
              <Typography variant="body2">
                About {data?.n_duplicates}
              </Typography>
              </Stack>
              <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary"}}>
                Duplicates percentage
              </Typography>
              <Typography>
              {(Math.round((data?.n_duplicates/data?.n_rows*100)*100)/100).toFixed(2)}%
              </Typography>
              </Stack>

              <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Missing titles
              </Typography>
              <Typography variant="body2">
                {data?.n_missing_title}
              </Typography>
              </Stack>

              <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Missing abstracts
              </Typography>
              <Typography variant="body2">
                {data?.n_missing_abstract}
              </Typography>
              </Stack>

          </Stack>

          {/* <canvas id='duplicates_chart'></canvas> */}

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

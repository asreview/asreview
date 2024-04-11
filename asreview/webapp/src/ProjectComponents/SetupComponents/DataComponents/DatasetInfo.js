import * as React from "react";
import { useQuery, useMutation } from "react-query";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { ProjectAPI } from "api";

import { styled} from "@mui/material/styles";

import DatasetChart from "ProjectComponents/AnalyticsComponents/DatasetChart";

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
          {data && (
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

            <Grid container spacing={2}>
              <Grid item xs={12}>
              <DatasetChart
                label={"Unique records"}
                part={
                  data?.n_rows - data?.n_duplicates
                }
                total={data?.n_rows}
              />
              </Grid>

              <Grid item xs={12}>
              <DatasetChart
                label={"Available titles"}
                part={data?.n_rows - data?.n_missing_title}
                total={data?.n_rows}
              />
              </Grid>

              <Grid item xs={12}>
              <DatasetChart
                label={"Available abstracts"}
                part={data?.n_rows - data?.n_missing_abstract}
                total={data?.n_rows}
              />
              </Grid>

              <Grid item xs={12}>
              <DatasetChart
                label={"English language"}
                part={n_english}
                total={data?.n_rows}
              />
              </Grid>
            </Grid>
          </Stack>

          )}

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
        
          </CardContent>
        

          <CardActions>
          <Button
            onClick={() => {
              deleteProject({ project_id: project_id });
            }}
          >
            Change dataset
          </Button>
          </CardActions>
      </Card>
    </Root>
  );
};

export default DatasetInfo;

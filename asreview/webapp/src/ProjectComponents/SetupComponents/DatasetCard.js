import { useMutation, useQuery } from "react-query";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Link,
  Skeleton,
} from "@mui/material";

import { ProjectAPI } from "api";
import DatasetChart from "ProjectComponents/AnalyticsComponents/DatasetChart";

const DatasetInfo = ({ project_id, dataset_path, setDataset }) => {
  const {
    data,
    // error: fetchDataError,
    // isError: isFetchDataError,
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

  return (
    <Card>
      <CardHeader
        title={isFetchingData ? <Skeleton width="30%" /> : "Your dataset"}
        subheader={
          <>
            {isFetchingData ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton width="40%" />
              </>
            ) : (
              <>
                Dataset{" "}
                <Box sx={{ fontWeight: "bold", display: "inline" }}>
                  {dataset_path}
                </Box>{" "}
                contains{" "}
                <Box sx={{ fontWeight: "bold", display: "inline" }}>
                  {data?.n_rows - data?.n_duplicates}
                </Box>{" "}
                unique records from a total of {data?.n_rows} records. The
                follow charts help to understand the dataset. Keep in mind that
                a clean and complete dataset improves the quality of ASReview.{" "}
                <Link
                  underline="none"
                  href={`https://asreview.nl/blog/active-learning-explained/`}
                  target="_blank"
                >
                  learn more
                </Link>
              </>
            )}
          </>
        }
      />

      {isFetchingData ? (
        <Skeleton sx={{ height: 140 }} variant="rectangular" />
      ) : (
        <CardMedia
          component="div"
          height="140"
          alt={"Dataset information"}
          sx={{ bgcolor: "primary.background" }}
        >
          <Grid container>
            <Grid item xs={12} sm={4} sx={{ width: "200px" }}>
              <DatasetChart
                label={"Title available"}
                part={data?.n_rows - data?.n_missing_title}
                total={data?.n_rows}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ width: "200px" }}>
              <DatasetChart
                label={"Abstract available"}
                part={data?.n_rows - data?.n_missing_abstract}
                total={data?.n_rows}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ width: "200px" }}>
              <DatasetChart
                label={"English language"}
                part={data?.n_english}
                total={data?.n_rows}
              />
            </Grid>
          </Grid>
        </CardMedia>
      )}

      <CardContent>
        {data?.n_unlabeled === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            The dataset contains labels for each record. You can see the label
            during screening while labeling the records yourself.
          </Alert>
        )}
        {data?.n_unlabeled !== 0 &&
          data?.n_relevant + data?.n_irrelavant > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              The dataset contains labels. The labels are added automatically to
              the prior knowledge.
            </Alert>
          )}
        {isFetchingData ? (
          <Skeleton>
            <Button />
          </Skeleton>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              deleteProject({ project_id: project_id });
            }}
          >
            Change
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetInfo;

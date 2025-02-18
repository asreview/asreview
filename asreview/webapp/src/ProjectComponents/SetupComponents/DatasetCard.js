import { useQuery } from "react-query";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Grid2 as Grid,
  Link,
  Skeleton,
} from "@mui/material";

import { ProjectAPI } from "api";
import DatasetChart from "ProjectComponents/AnalyticsComponents/DatasetChart";

const DatasetCard = ({
  project_id,
  dataset_path,
  // onResetDataset,
  hideLabeledInfo = false,
}) => {
  const { data, isFetching: isFetchingData } = useQuery(
    ["fetchData", { project_id: project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    },
  );

  // const { mutate: deleteProject } = useMutation(
  //   ProjectAPI.mutateDeleteProject,
  //   {
  //     mutationKey: ["mutateDeleteProject"],
  //     onSuccess: onResetDataset,
  //   },
  // );

  return (
    <Card>
      <CardHeader
        title={isFetchingData ? <Skeleton width="30%" /> : "Dataset"}
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
          <Grid
            container
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
              sx={{ maxWidth: "300px" }}
            >
              <DatasetChart
                label={"Title available"}
                part={data?.n_rows - data?.n_missing_title}
                total={data?.n_rows}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
              sx={{ maxWidth: "300px" }}
            >
              <DatasetChart
                label={"Abstract available"}
                part={data?.n_rows - data?.n_missing_abstract}
                total={data?.n_rows}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
              sx={{ maxWidth: "300px" }}
            >
              <DatasetChart
                label={"URL or DOI available"}
                part={data?.n_rows - data?.n_missing_urn}
                total={data?.n_rows}
              />
            </Grid>
          </Grid>
        </CardMedia>
      )}
      <CardContent>
        {!hideLabeledInfo && data?.n_unlabeled === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            The dataset contains labels for each record. You can see the label
            during screening while labeling the records yourself.
          </Alert>
        )}
        {!hideLabeledInfo &&
          data?.n_unlabeled > 0 &&
          data?.n_relevant + data?.n_irrelevant > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              The dataset contains labels. The labels are added to the prior
              knowledge.
            </Alert>
          )}
        {/* {isFetchingData ? (
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
        )} */}
      </CardContent>
    </Card>
  );
};

export default DatasetCard;

import { useQuery } from "react-query";
import React from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Grid2 as Grid,
  IconButton,
  Popover,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import { ProjectAPI } from "api";
import DatasetChart from "ProjectComponents/AnalyticsComponents/DatasetChart";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const DatasetCard = ({
  project_id,
  // onResetDataset,
  hideLabeledInfo = false,
}) => {
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);

  const { data, isFetching: isFetchingData } = useQuery(
    ["fetchData", { project_id: project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    },
  );

  const handlePopoverOpen = (event) => {
    setAnchorElInfo(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorElInfo(null);
  };

  return (
    <Card sx={{ position: "relative" }}>
      <CardHeader
        sx={{ mb: 4 }}
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
                This dataset contains{" "}
                <Box sx={{ fontWeight: "bold", display: "inline" }}>
                  {data?.n_rows}
                </Box>{" "}
                records;{" "}
                {data?.n_duplicated === 0 ? (
                  "all of which are unique"
                ) : (
                  <>
                    <Box sx={{ fontWeight: "bold", display: "inline" }}>
                      {data?.n_rows - data?.n_duplicated}
                    </Box>{" "}
                    are likely unique
                  </>
                )}
              </>
            )}
          </>
        }
      />
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        <IconButton size="small" onClick={handlePopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
      </Box>
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
                part={data?.n_urn}
                total={data?.n_rows}
              />
            </Grid>
          </Grid>
        </CardMedia>
      )}
      <CardContent sx={{ mt: 4 }}>
        {!hideLabeledInfo && data?.n_unlabeled === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            The dataset contains labels for each record. You can see the label
            during screening while labeling the records yourself
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
      <Popover
        open={Boolean(anchorElInfo)}
        anchorEl={anchorElInfo}
        onClose={handlePopoverClose}
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
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Dataset Information
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "justify", mb: 2 }}>
                The following charts provide insights into the composition of
                your dataset.
              </Typography>
              <Alert severity="info">
                A clean and complete dataset improves the quality of your
                screening process with ASReview
              </Alert>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Button
                href="https://asreview.nl/blog/active-learning-explained/"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Learn more
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Card>
  );
};

export default DatasetCard;

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
import { CardErrorHandler } from "../../../Components";
import { ProjectAPI } from "../../../api";

import { styled } from "@mui/material/styles";

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

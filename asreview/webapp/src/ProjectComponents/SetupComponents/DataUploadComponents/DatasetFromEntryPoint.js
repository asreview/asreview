import { useMutation, useQuery } from "react-query";

import { Box, Grid2 as Grid, Stack, Typography } from "@mui/material";

import { ProjectAPI } from "api";
import { EntryPointDataset } from ".";

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

  return (
    <Box>
      {data && (
        <Stack spacing={2}>
          {data?.result.map((group, index) => (
            <Stack spacing={2} key={index}>
              <Typography variant="h5" fontFamily="Roboto Serif">
                {group.description}
              </Typography>
              <Grid container spacing={4} columns={6}>
                {group.datasets.map((dataset, index) => (
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
            </Stack>
          ))}
        </Stack>
        // )};
      )}
    </Box>
  );
};

export default DatasetFromEntryPoint;

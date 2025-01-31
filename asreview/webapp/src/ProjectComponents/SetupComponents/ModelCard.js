import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { projectModes } from "globals.js";
import { useContext } from "react";

const ModelComponentSelect = ({
  name,
  label,
  items,
  value,
  handleModel,
  disableItem,
  helperText,
  editable = true,
}) => (
  <FormControl>
    <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
    <Select
      id={`select-${name}`}
      name={name}
      label={label}
      value={value ? value : ""}
      onChange={handleModel}
      disabled={!editable}
    >
      {items.map((value) => (
        <MenuItem
          key={`result-item-${value.name}`}
          checked={value === value.name}
          value={value.name}
          disabled={disableItem ? disableItem(value.name) : false}
        >
          <Box>
            <Typography variant="subtitle1">{value.label}</Typography>
            {value.description && (
              <Typography
                variant="body2"
                gutterBottom
                sx={{ color: "text.secondary" }}
              >
                {value.description}
              </Typography>
            )}
          </Box>
        </MenuItem>
      ))}
    </Select>
    <FormHelperText>{helperText}</FormHelperText>
  </FormControl>
);

const ModelCard = ({ mode = null, trainNewModel = false }) => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const [model, setModel] = React.useState({
    name: "ultra-3",
    params: null,
  });

  const { mutate, isLoading } = useMutation(ProjectAPI.mutateModelConfig, {
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["fetchModelConfig", { project_id: project_id }],
        data,
      );
    },
  });

  const { data: modelOptions } = useQuery(
    "fetchModelOptions",
    ProjectAPI.fetchModelOptions,
    {
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: modelConfig,
    isLoading: isLoadingModelConfig,
    // error: fetchModelConfigError,
    // isError: isFetchModelConfigError,
    // isFetching: isFetchingModelConfig,
    // isSuccess: isSuccessModelConfig,
  } = useQuery(
    ["fetchModelConfig", { project_id: project_id }],
    ProjectAPI.fetchModelConfig,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Card>
      <CardHeader
        title="AI model"
        subheader={
          <>
            <>
              {projectModes.SIMULATION === mode
                ? "Select or compose an AI model to simulate the performance of your review process."
                : "Select or compose an AI model to accelerate your review process."}
            </>
            <Link
              underline="none"
              href={`https://asreview.nl/blog/active-learning-explained/`}
              target="_blank"
            >
              learn more
            </Link>
          </>
        }
      />

      <CardContent>
        {!isLoadingModelConfig && (
          <FormControl fullWidth>
            <InputLabel id="model-select-label">Select Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={model.name}
              onChange={(event) => {
                setModel({ name: event.target.value, params: null });
              }}
              label="Select Model"
              sx={{ mb: 3 }}
            >
              <ListSubheader>
                Ultra - Lightweight and performant model for every dataset
              </ListSubheader>
              <MenuItem value="ultra-3">ELAS ultra-3 </MenuItem>
              <MenuItem value="ultra-2">ELAS ultra-2 </MenuItem>
              <Divider />

              <ListSubheader>
                Language Agnostic - Optimized for handling multiple languages at
                once
              </ListSubheader>
              <MenuItem value="lang-3">ELAS lang-2 </MenuItem>
              <Divider />

              <ListSubheader>
                Heavy - Modern, heavyweight model for heavy work
              </ListSubheader>
              <MenuItem value="heavy-4">ELAS heavy-4 </MenuItem>
              <Divider />

              <ListSubheader>
                Custom - Built your own learner from available components
              </ListSubheader>
              <MenuItem value="custom">Custom </MenuItem>
            </Select>

            {model.name === "custom" && (
              <>
                <Divider sx={{ mb: 3 }} />
                <Box>
                  <Stack direction="column" spacing={3}>
                    <ModelComponentSelect
                      name="querier"
                      label="Querier"
                      items={modelOptions?.querier}
                      value={model.params?.querier}
                      handleModel={(event) => {
                        setModel({
                          ...model,
                          params: {
                            ...model.params,
                            querier: event.target.value,
                          },
                        });
                      }}
                    />
                    <ModelComponentSelect
                      name="feature_extractor"
                      label="Feature extractor"
                      items={modelOptions?.feature_extractor}
                      value={model?.params?.feature_extractor}
                      handleModel={(event) => {
                        setModel({
                          ...model,
                          params: {
                            ...model.params,
                            feature_extractor: event.target.value,
                          },
                        });
                      }}
                    />
                    <ModelComponentSelect
                      name="classifier"
                      label="Classifier"
                      items={modelOptions?.classifier}
                      value={model.params?.classifier}
                      handleModel={(event) => {
                        setModel({
                          ...model,
                          params: {
                            ...model.params,
                            classifier: event.target.value,
                          },
                        });
                      }}
                    />
                    <ModelComponentSelect
                      name="balancer"
                      label="Balancer"
                      items={modelOptions?.balancer}
                      value={model.params?.balancer}
                      handleModel={(event) => {
                        setModel({
                          ...model,
                          params: {
                            ...model.params,
                            balancer: event.target.value,
                          },
                        });
                      }}
                    />
                  </Stack>
                </Box>
              </>
            )}
          </FormControl>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelCard;

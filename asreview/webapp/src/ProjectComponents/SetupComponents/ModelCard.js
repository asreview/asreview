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
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
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
  onChange,
  helperText = "",
  required = false,
}) => (
  <FormControl>
    <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
    <Select
      id={`select-${name}`}
      name={name}
      label={label}
      value={value ? value : ""}
      onChange={onChange}
      required={required}
    >
      {items.map((value) => (
        <MenuItem
          key={`result-item-${value.name}`}
          checked={value === value.name}
          value={value.name}
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

  const { mutate } = useMutation(ProjectAPI.mutateLearner, {
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["fetchLearner", { project_id: project_id }],
        data,
      );
    },
  });

  const { data: learnerOptions, isLoading: isLoadingLearnerOptions } = useQuery(
    "fetchLearners",
    ProjectAPI.fetchLearners,
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: modelConfig, isLoading: isLoadingModelConfig } = useQuery(
    ["fetchLearner", { project_id: project_id }],
    ProjectAPI.fetchLearner,
    {
      refetchOnWindowFocus: false,
    },
  );

  const isLoading = isLoadingLearnerOptions || isLoadingModelConfig;

  return (
    <Card>
      <CardHeader
        title={isLoading ? <Skeleton width={100} /> : "AI model"}
        subheader={
          isLoading ? (
            <Skeleton width="80%" />
          ) : (
            <>
              <>
                {projectModes.SIMULATION === mode
                  ? "Select or compose an AI model to simulate the performance of your review process. "
                  : "Select or compose an AI model to accelerate your review process. "}
              </>
              <Link
                underline="none"
                href={`https://asreview.nl/blog/active-learning-explained/`}
                target="_blank"
              >
                learn more
              </Link>
            </>
          )
        }
      />

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={56} />
        ) : (
          <FormControl fullWidth>
            <InputLabel id="model-select-label">Select Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={modelConfig.name}
              onChange={(event) => {
                mutate({
                  project_id: project_id,
                  name: event.target.value,
                  params: {},
                });
              }}
              label="Select Model"
              sx={{ mb: 3 }}
            >
              <ListSubheader>
                Ultra - Lightweight and performant model for every dataset
              </ListSubheader>

              {learnerOptions.learners
                .filter((learner) => learner.type === "ultra")
                .map((learner) => (
                  <MenuItem key={learner.name} value={learner.name}>
                    {learner.label}
                  </MenuItem>
                ))}

              <Divider />

              <ListSubheader>
                Language Agnostic - Optimized for handling multiple languages at
                once
              </ListSubheader>

              {learnerOptions.learners
                .filter((learner) => learner.type === "lang")
                .map((learner) => (
                  <MenuItem key={learner.name} value={learner.name}>
                    {learner.label}
                  </MenuItem>
                ))}

              <Divider />

              <ListSubheader>
                Heavy - Modern, heavyweight model for heavy work
              </ListSubheader>

              {learnerOptions.learners
                .filter((learner) => learner.type === "heavy")
                .map((learner) => (
                  <MenuItem key={learner.name} value={learner.name}>
                    {learner.label}
                  </MenuItem>
                ))}
              <Divider />

              <ListSubheader>
                Custom - Built your own learner from available components
              </ListSubheader>
              <MenuItem value="custom">Custom </MenuItem>
            </Select>

            {modelConfig.name === "custom" && learnerOptions && (
              <>
                <Divider sx={{ mb: 3 }} />
                <Box>
                  <Stack direction="column" spacing={3}>
                    <ModelComponentSelect
                      name="querier"
                      label="Querier"
                      items={learnerOptions?.models?.querier}
                      value={modelConfig.params?.querier}
                      required={true}
                      onChange={(event) => {
                        mutate({
                          project_id: project_id,
                          ...modelConfig,
                          params: {
                            ...modelConfig.params,
                            querier: event.target.value,
                          },
                        });
                      }}
                    />
                    <ModelComponentSelect
                      name="feature_extractor"
                      label="Feature extractor"
                      items={learnerOptions?.models?.feature_extractor}
                      value={modelConfig?.params?.feature_extractor}
                      onChange={(event) => {
                        mutate({
                          project_id: project_id,
                          ...modelConfig,
                          params: {
                            ...modelConfig.params,
                            feature_extractor: event.target.value,
                          },
                        });
                      }}
                    />
                    <ModelComponentSelect
                      name="classifier"
                      label="Classifier"
                      items={learnerOptions?.models?.classifier}
                      value={modelConfig.params?.classifier}
                      onChange={(event) => {
                        mutate({
                          project_id: project_id,
                          ...modelConfig,
                          params: {
                            ...modelConfig.params,
                            classifier: event.target.value,
                          },
                        });
                      }}
                    />
                    <ModelComponentSelect
                      name="balancer"
                      label="Balancer"
                      items={learnerOptions?.models?.balancer}
                      value={modelConfig.params?.balancer}
                      onChange={(event) => {
                        mutate({
                          project_id: project_id,
                          ...modelConfig,
                          params: {
                            ...modelConfig.params,
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

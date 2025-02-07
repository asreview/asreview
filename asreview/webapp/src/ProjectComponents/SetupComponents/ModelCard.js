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
      {!required && (
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
      )}

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

  const {
    data: learnerOptions,
    isLoading: isLoadingLearnerOptions,
    error: errorLearnerOptions,
  } = useQuery("fetchLearners", ProjectAPI.fetchLearners, {
    refetchOnWindowFocus: false,
  });

  const {
    data: modelConfig,
    isLoading: isLoadingModelConfig,
    error: errorModelConfig,
  } = useQuery(
    ["fetchLearner", { project_id: project_id }],
    ProjectAPI.fetchLearner,
    {
      refetchOnWindowFocus: false,
    },
  );

  const isLoading = isLoadingLearnerOptions || isLoadingModelConfig;
  const error = errorLearnerOptions || errorModelConfig;

  return (
    <Card>
      <CardHeader
        title={isLoading ? <Skeleton width={60} /> : "AI"}
        subheader={
          isLoading ? (
            <Skeleton width="80%" />
          ) : (
            <>
              <>
                {projectModes.SIMULATION === mode
                  ? "Select or compose an AI to simulate the performance of your review process. "
                  : "Select or compose an AI to accelerate your review process. "}
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
          <>
            {!error ? (
              <FormControl fullWidth>
                <InputLabel id="model-select-label">Select learner</InputLabel>
                <Select
                  labelId="model-select-label"
                  value={modelConfig.name}
                  onChange={(event) => {
                    mutate({
                      project_id: project_id,
                      name: event.target.value,
                      current_value: {},
                    });
                  }}
                  label="Select Model"
                  sx={{ mb: 3 }}
                >
                  <ListSubheader>
                    Ultra - Fast, lightweight learner for performant reviewing
                  </ListSubheader>

                  {learnerOptions.learners
                    .filter((learner) => learner.type === "ultra")
                    .map((learner) => (
                      <MenuItem
                        key={learner.name}
                        value={learner.name}
                        disabled={!learner.is_available}
                      >
                        <Typography>{learner.label}</Typography>
                      </MenuItem>
                    ))}

                  <Divider />

                  <ListSubheader>
                    Language Agnostic - Optimized for handling multiple
                    languages at once
                  </ListSubheader>

                  {learnerOptions.learners
                    .filter((learner) => learner.type === "lang")
                    .map((learner) => (
                      <MenuItem
                        key={learner.name}
                        value={learner.name}
                        disabled={!learner.is_available}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            width: 1,
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography>{learner.label}</Typography>
                          {!learner.is_available && (
                            <Typography color="error">
                              Requires the free ASReview-NEMO extension
                            </Typography>
                          )}
                        </Stack>
                      </MenuItem>
                    ))}

                  <Divider />

                  <ListSubheader>
                    Heavy - Modern, heavyweight learner for heavy work
                  </ListSubheader>

                  {learnerOptions.learners
                    .filter((learner) => learner.type === "heavy")
                    .map((learner) => (
                      <MenuItem
                        key={learner.name}
                        value={learner.name}
                        disabled={!learner.is_available}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            width: 1,
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography>{learner.label}</Typography>
                          {!learner.is_available && (
                            <Typography color="error">
                              Requires the free ASReview-NEMO extension
                            </Typography>
                          )}
                        </Stack>
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
                          value={modelConfig.current_value?.querier}
                          required={true}
                          onChange={(event) => {
                            mutate({
                              project_id: project_id,
                              ...modelConfig,
                              current_value: {
                                ...modelConfig.current_value,
                                querier: event.target.value,
                              },
                            });
                          }}
                        />
                        <ModelComponentSelect
                          name="feature_extractor"
                          label="Feature extractor"
                          items={learnerOptions?.models?.feature_extractor}
                          value={modelConfig?.current_value?.feature_extractor}
                          onChange={(event) => {
                            mutate({
                              project_id: project_id,
                              ...modelConfig,
                              current_value: {
                                ...modelConfig.current_value,
                                feature_extractor: event.target.value,
                              },
                            });
                          }}
                        />
                        <ModelComponentSelect
                          name="classifier"
                          label="Classifier"
                          items={learnerOptions?.models?.classifier}
                          value={modelConfig.current_value?.classifier}
                          onChange={(event) => {
                            mutate({
                              project_id: project_id,
                              ...modelConfig,
                              current_value: {
                                ...modelConfig.current_value,
                                classifier: event.target.value,
                              },
                            });
                          }}
                        />
                        <ModelComponentSelect
                          name="balancer"
                          label="Balancer"
                          items={learnerOptions?.models?.balancer}
                          value={modelConfig.current_value?.balancer}
                          onChange={(event) => {
                            mutate({
                              project_id: project_id,
                              ...modelConfig,
                              current_value: {
                                ...modelConfig.current_value,
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
            ) : (
              <Typography variant="body1" color="error">
                Failed to load AI.
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelCard;

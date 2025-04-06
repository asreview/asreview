import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
  IconButton,
  Popover,
  Button,
  Grid,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import React from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import LanguageIcon from "@mui/icons-material/Language";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import SearchIcon from "@mui/icons-material/Search";
import ExtractIcon from "@mui/icons-material/ContentCopy";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BalanceIcon from "@mui/icons-material/Balance";

import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { projectModes } from "globals.js";
import { useContext } from "react";
import { LoadingCardHeader } from "StyledComponents/LoadingCardheader";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

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
  const [anchorEl, setAnchorEl] = React.useState(null);

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

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ position: "relative" }}>
      <LoadingCardHeader
        isLoading={isLoading}
        title="AI"
        subheader={
          projectModes.SIMULATION === mode
            ? "Select or compose an AI to simulate the performance of your review process"
            : "Select or compose an AI to accelerate your review process"
        }
      />

      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <IconButton size="small" onClick={handlePopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
      </Box>

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={56} />
        ) : (
          <>
            {!error ? (
              <>
                {modelConfig.name && !modelConfig.name.startsWith("elas_u") && (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 3,
                    }}
                  >
                    The selected model might need longer to train than ultra
                    models. You can continue screening and once the model is
                    trained, it will be used for the next records.
                  </Alert>
                )}
                <FormControl fullWidth>
                  <InputLabel id="model-select-label">
                    Select learner
                  </InputLabel>
                  <Select
                    labelId="model-select-label"
                    value={modelConfig.name}
                    onChange={(event) => {
                      mutate({
                        project_id: project_id,
                        name: event.target.value,
                        current_value:
                          event.target.value === "custom"
                            ? { querier: "max" }
                            : {},
                      });
                    }}
                    label="Select Model"
                    sx={{ mb: 3 }}
                  >
                    <ListSubheader sx={{ bgcolor: "transparent" }}>
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

                    <ListSubheader sx={{ bgcolor: "transparent" }}>
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
                              alignItems: "center",
                            }}
                          >
                            <Typography>{learner.label}</Typography>
                            {!learner.is_available && (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography
                                  color="error.main"
                                  variant="caption"
                                  fontWeight="medium"
                                >
                                  Requires ASReview-NEMO
                                </Typography>
                                <Box
                                  component="span"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      "https://asreview.nl/nemo",
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  }}
                                  sx={{
                                    color: "primary.main",
                                    textDecoration: "none",
                                    "&:hover": {
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                    },
                                    fontSize: "0.75rem",
                                    mt: 0.5,
                                    display: "inline-block",
                                    pointerEvents: "auto",
                                  }}
                                >
                                  Learn more
                                </Box>
                              </Box>
                            )}
                          </Stack>
                        </MenuItem>
                      ))}

                    <Divider />

                    <ListSubheader sx={{ bgcolor: "transparent" }}>
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
                              alignItems: "center",
                            }}
                          >
                            <Typography>{learner.label}</Typography>
                            {!learner.is_available && (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography
                                  color="error.main"
                                  variant="caption"
                                  fontWeight="medium"
                                >
                                  Requires ASReview-NEMO
                                </Typography>
                                <Box
                                  component="span"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      "https://asreview.nl/nemo",
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  }}
                                  sx={{
                                    color: "primary.main",
                                    textDecoration: "none",
                                    "&:hover": {
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                    },
                                    fontSize: "0.75rem",
                                    mt: 0.5,
                                    display: "inline-block",
                                    pointerEvents: "auto",
                                  }}
                                >
                                  Learn more
                                </Box>
                              </Box>
                            )}
                          </Stack>
                        </MenuItem>
                      ))}
                    <Divider />

                    <ListSubheader sx={{ bgcolor: "transparent" }}>
                      Custom - Built your own learner from available components
                    </ListSubheader>
                    <MenuItem value="custom">Custom </MenuItem>
                  </Select>

                  {modelConfig.name === "custom" && learnerOptions && (
                    <>
                      <Divider sx={{ mb: 3 }} />
                      <Alert
                        severity="warning"
                        sx={{
                          mb: 3,
                        }}
                      >
                        You can compose your own model by selecting different
                        components. This is an advanced feature and not
                        recommended for most users.
                      </Alert>
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
                            value={
                              modelConfig?.current_value?.feature_extractor
                            }
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
              </>
            ) : (
              <Typography variant="body1" color="error">
                Failed to load AI.
              </Typography>
            )}
          </>
        )}
      </CardContent>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 480,
          },
        }}
      >
        <Box
          sx={(theme) => ({
            p: 3,
            maxHeight: "80vh", // Limit height to 80% of viewport
            overflow: "auto", // Enable scrolling
            // Custom scrollbar styling
            "&::-webkit-scrollbar": {
              width: "8px",
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: (theme) => theme.palette.grey[300],
              borderRadius: "4px",
              "&:hover": {
                background: (theme) => theme.palette.grey[400],
              },
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
              borderRadius: "4px",
            },
            // Firefox scrollbar styling
            scrollbarWidth: "thin",
            scrollbarColor: (theme) => `${theme.palette.grey[300]} transparent`,
          })}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                AI Models Explained
              </Typography>
              <Typography variant="body2" align="justify">
                The AI model is the engine that powers your systematic review.
                It learns from your decisions to identify relevant records and
                accelerate your review process.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Choose Your Model
              </Typography>
              <Stack spacing={2}>
                <Box
                  sx={(theme) => ({
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "background.paper"
                        : "transparent",
                  })}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: "50%",
                        p: 1,
                        display: "flex",
                      }}
                    >
                      <BoltIcon sx={{ color: "text.secondary" }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Ultra</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fast & efficient for most reviews
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Quick • Lightweight
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={(theme) => ({
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "background.paper"
                        : "transparent",
                  })}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: "50%",
                        p: 1,
                        display: "flex",
                      }}
                    >
                      <LanguageIcon sx={{ color: "text.secondary" }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">
                        Language Agnostic
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Optimized for multilingual content
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Multilingual • Flexible
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={(theme) => ({
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "background.paper"
                        : "transparent",
                  })}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: "50%",
                        p: 1,
                        display: "flex",
                      }}
                    >
                      <PrecisionManufacturingIcon
                        sx={{ color: "text.secondary" }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Heavy</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Advanced models for complex reviews
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Powerful • Precise
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Custom Model Components
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "background.paper"
                          : "transparent",
                    })}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SearchIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="subtitle2">Querier</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Selects which records to show you next, prioritizing
                        potentially relevant ones
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "background.paper"
                          : "transparent",
                    })}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ExtractIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="subtitle2">
                          Feature Extractor
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Converts text into numerical features that the AI can
                        understand
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "background.paper"
                          : "transparent",
                    })}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PsychologyIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="subtitle2">Classifier</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Makes predictions about relevance based on your
                        decisions
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "background.paper"
                          : "transparent",
                    })}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <BalanceIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="subtitle2">Balancer</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Handles imbalanced data to improve learning accuracy
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Tips for Best Results
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body2">
                  • Start with <strong>Ultra</strong> model for most reviews -
                  it's fast and effective
                </Typography>
                <Typography variant="body2">
                  • Use <strong>Language Agnostic</strong> for multilingual
                  datasets
                </Typography>
                <Typography variant="body2">
                  • Try <strong>Heavy</strong> models for large, complex
                  systematic reviews
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Button
                href="https://asreview.readthedocs.io/en/latest/guides/activelearning.html"
                target="_blank"
                rel="noopener noreferrer"
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

export default ModelCard;

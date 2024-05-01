import * as React from "react";
import { useMutation, useQuery } from "react-query";
import {
  Box,
  CircularProgress,
  Link,
  Stack,
  Typography,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "Components";
import { ModelSelect } from ".";
import { ProjectAPI } from "api";
import { defaultAlgorithms } from "globals.js";
import { SelectItem } from "ProjectComponents";
import { useContext } from "react";
import { ProjectContext } from "ProjectContext";

const PREFIX = "ModelForm";

const classes = {
  title: `${PREFIX}-title`,
  loading: `${PREFIX}-loading`,
  custom: `${PREFIX}-custom`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 16,
  },

  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
  },

  [`& .${classes.custom}`]: {
    paddingTop: 16,
    // add grey.100 background color
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "background.paper" : "grey.100",
  },
}));

const DEFAULT_CLASSIFIERS = [
  {
    name: "tfidf-nb-max-double",
    title: "Model Always Good",
    description:
      "A classic combination that has proven to work well in the ASReview context, as shown in many simulations. It especially handles the starting phase of the systematic review well, being able to handle little amounts of data.",
  },
  {
    name: "onehot-logistic-max-double",
    title: "Model One Word",
    description:
      "A model that excels in finding specific words, providing good performance in finding the last remaining relevant documents.",
  },
  {
    name: "labse-logistic-max-double",
    title: "Model Multi Language",
    requires: "asreview-nemo",
    description:
      "A multilingual feature extractor for systematic review datasets in multiple languages (LaBSE x Logistic Regression).",
  },
  {
    name: "sbert-rf-max-double",
    title: "Model Context",
    requires: "asreview-nemo",
    description:
      "A powerful pretrained model based on the transformer infrastructure used in the latest AI models. Combined with a proven implementation of a gradient boosting classifier (SBert x XGBoost).",
  },
  {
    name: "doc2vec-dynamic_nn-max-double",
    title: "Model Neural",
    requires: "asreview-nemo",
    description:
      "A classifier and feature extractor combination both based on neural network architectures. Long training time and needs more data, but unrivaled performance in the final screening stages (Wide-Doc2Vec x Dynamic Neural Network).",
  },
];

const getFullModelName = (model) => {
  let name =
    model.feature_extraction +
    "-" +
    model.classifier +
    "-" +
    model.query_strategy +
    "-" +
    model.balance_strategy;
  let defaultModel = DEFAULT_CLASSIFIERS.filter((e) => e.name === name);

  if (defaultModel.length === 1) {
    return defaultModel[0].name;
  } else {
    return "custom";
  }
};

const ModelForm = ({
  editable = true,
  showWarning = false,
  trainNewModel = false,
}) => {
  const project_id = useContext(ProjectContext);

  const [modelState, setModelState] = React.useState({
    custom: false,
    isChanged: false,
    warning: {
      active: false,
      value: null,
    },
    model: defaultAlgorithms,
  });

  const {
    data: modelOptions,
    error: fetchModelOptionsError,
    isError: isFetchModelOptionsError,
    isFetching: isFetchingModelOptions,
  } = useQuery("fetchModelOptions", ProjectAPI.fetchModelOptions, {
    refetchOnWindowFocus: false,
  });

  const {
    error: fetchModelConfigError,
    isError: isFetchModelConfigError,
    isFetching: isFetchingModelConfig,
  } = useQuery(
    ["fetchModelConfig", { project_id: project_id }],
    ProjectAPI.fetchModelConfig,
    {
      enabled: project_id !== null,
      onSuccess: (data) => {
        setModelState({
          custom: getFullModelName(data) === "custom",
          isChanged: modelState.isChanged,
          model: data,
          warning: { ...modelState.warning },
        });
      },
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: mutateModelConfig, isError: isMutateModelConfigError } =
    useMutation(ProjectAPI.mutateModelConfig, {
      mutationKey: "mutateModelConfig",
    });

  const prepareMutationData = React.useCallback(
    () => ({
      project_id: project_id,
      ...modelState.model,
      trainNewModel: trainNewModel,
    }),
    [project_id, modelState, trainNewModel],
  );

  const handleModelCustom = (event) => {
    const { name, value } = event.target;
    setModelState({
      custom: modelState.custom,
      isChanged: true,
      model: { ...modelState.model, ...{ [name]: value } },
      warning: { ...modelState.warning },
    });
  };

  const acceptModelChange = ({ value }) => {
    const changeValue = value === undefined ? modelState.warning.value : value;

    if (changeValue === "custom") {
      setModelState({
        custom: true,
        isChanged: true,
        model: modelState.model,
        warning: {
          active: false,
          value: null,
        },
      });
    } else {
      let parts = changeValue.split("-");
      setModelState({
        custom: false,
        isChanged: true,
        model: {
          feature_extraction: parts[0],
          classifier: parts[1],
          query_strategy: parts[2],
          balance_strategy: parts[3],
        },
        warning: {
          active: false,
          value: null,
        },
      });
    }
  };

  const cancelWarning = () => {
    setModelState({
      custom: modelState.custom,
      isChanged: modelState.isChanged,
      model: modelState.model,
      warning: {
        active: false,
        value: null,
      },
    });
  };

  const handleModelDropdownChange = (event) => {
    const { value } = event.target;

    if (showWarning) {
      setModelState({
        custom: modelState.custom,
        isChanged: modelState.isChanged,
        model: modelState.model,
        warning: {
          active: true,
          value: value,
        },
      });
    } else {
      acceptModelChange({ value });
    }
  };

  React.useEffect(() => {
    if (modelState.isChanged) {
      mutateModelConfig(prepareMutationData());
    }
  }, [modelState, mutateModelConfig, prepareMutationData]);

  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Model</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          An active learning model consists of a feature extraction technique, a
          classifier, a query strategy, and a balance strategy. The default
          setup (TF-IDF, Naive Bayes, Maximum, Dynamic resampling) overall has
          great time saving.{" "}
          <Link
            underline="none"
            href={`https://asreview.nl/blog/active-learning-explained/`}
            target="_blank"
          >
            Learn more
          </Link>
        </Typography>
      </Box>
      <Stack spacing={3} sx={{ mt: 3 }}>
        {(isFetchingModelOptions || isFetchingModelConfig) && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
        {!isFetchingModelOptions && !isFetchingModelConfig && (
          <Box component="form" noValidate autoComplete="off">
            <FormControl
              disabled={!editable}
              fullWidth
              variant={editable ? "outlined" : "filled"}
              error={isMutateModelConfigError}
            >
              <InputLabel id="model-select-label">Model</InputLabel>
              <Select
                labelId="model-select-label"
                id="model-select"
                // inputProps={{
                //   onFocus: () => onFocus(),
                //   onBlur: () => onBlur(),
                // }}
                name="model"
                label="Model"
                value={
                  modelState.custom
                    ? "custom"
                    : getFullModelName(modelState.model)
                }
                onChange={handleModelDropdownChange}
              >
                {/* iterater over the default models */}
                {DEFAULT_CLASSIFIERS.map((value) => (
                  <MenuItem
                    value={value.name}
                    key={`result-item-${value.name}`}
                    divider
                  >
                    <SelectItem
                      primary={
                        <Box>
                          {value.title}{" "}
                          {value.requires && (
                            <Box sx={{ color: "blue", display: "inline" }}>
                              (requires {value.requires})
                            </Box>
                          )}
                        </Box>
                      }
                      secondary={value.description}
                    />
                  </MenuItem>
                ))}

                <MenuItem value={"custom"}>
                  <SelectItem
                    primary="Custom"
                    secondary="Built the model yourself by picking a feature extractor, classifier, query strategy, and balance strategy."
                  />
                </MenuItem>
              </Select>
              {isMutateModelConfigError && (
                <FormHelperText style={{ fontSize: "16px" }}>
                  ASReview NEMO (New Exciting MOdels) extension isn't installed.
                  Please install the{" "}
                  <Link
                    underline="none"
                    href={`https://asreview.readthedocs.io/en/latest/guide/installation.html#installing-nemo-models`}
                    target="_blank"
                  >
                    {" "}
                    NEMO models
                  </Link>{" "}
                  extension to use this model.
                </FormHelperText>
              )}
            </FormControl>

            {modelState.custom && (
              <Box className={classes.custom}>
                <Stack direction="column" spacing={3}>
                  <ModelSelect
                    name="feature_extraction"
                    label="Feature extraction technique"
                    items={modelOptions?.feature_extraction}
                    model={modelState.model}
                    handleModel={handleModelCustom}
                    editable={editable}
                  />
                  <ModelSelect
                    name="classifier"
                    label="Classifier"
                    items={modelOptions?.classifier}
                    model={modelState.model}
                    handleModel={handleModelCustom}
                    editable={editable}
                  />
                  <ModelSelect
                    name="query_strategy"
                    label="Query strategy"
                    items={modelOptions?.query_strategy}
                    model={modelState.model}
                    handleModel={handleModelCustom}
                    helperText={
                      modelState.model?.query_strategy === "random"
                        ? "Your review is not accelerated by the model"
                        : undefined
                    }
                    editable={editable}
                  />
                  <ModelSelect
                    name="balance_strategy"
                    label="Balance strategy"
                    items={modelOptions?.balance_strategy}
                    model={modelState.model}
                    handleModel={handleModelCustom}
                    editable={editable}
                  />
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Stack>
      <Dialog
        open={modelState.warning.active}
        onClose={cancelWarning}
        aria-labelledby="mutate-warning-dialog-title"
        aria-describedby="mutate-warning-dialog-description"
      >
        <DialogTitle id="mutate-warning-dialog-title">
          Change the model?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="mutate-warning-dialog-description">
            You are about to change the model. When you continue screening, a
            model will be trained based on the new settings. Are you sure you
            want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelWarning} color="primary">
            Cancel
          </Button>
          <Button onClick={acceptModelChange} color="primary" autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <CardErrorHandler
        queryKey={"fetchModelOptions"}
        error={fetchModelOptionsError}
        isError={isFetchModelOptionsError}
      />
      <CardErrorHandler
        queryKey={"fetchModelConfig"}
        error={fetchModelConfigError}
        isError={isFetchModelConfigError}
      />
    </Root>
  );
};

export default ModelForm;

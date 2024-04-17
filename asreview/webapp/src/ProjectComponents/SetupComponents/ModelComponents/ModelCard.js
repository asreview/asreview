import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  CircularProgress,
  Radio,
  Link,
  Stack,
  Slider,
  Typography,
  Skeleton,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  RadioGroup,
  FormLabel,
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
import modelAlwaysGood from "images/models/modelAlwaysGood.png";
import { useToggle } from "hooks/useToggle";

const DEFAULT_MODELS = [
  {
    name: "tfidf-nb-max-double",
    title: "AlwaysGood",
    description:
      "AlwaysGood is a classic combination that has proven to work well in the ASReview context, as shown in many simulations. It especially handles the starting phase of the systematic review well, being able to handle little amounts of data.",
  },
  {
    name: "onehot-logistic-max-double",
    title: "One Word",
    description:
      "A model that excels in finding specific words, providing good performance in finding the last remaining relevant documents.",
  },
  {
    name: "labse-logistic-max-double",
    title: "MultiLanguage",
    requires: "asreview-nemo",
    description:
      "A multilingual feature extractor for systematic review datasets in multiple languages (LaBSE x Logistic Regression).",
  },
  {
    name: "sbert-rf-max-double",
    title: "Context",
    requires: "asreview-nemo",
    description:
      "A powerful pretrained model based on the transformer infrastructure used in the latest AI models. Combined with a proven implementation of a gradient boosting classifier (SBert x XGBoost).",
  },
  {
    name: "doc2vec-dynamic_nn-max-double",
    title: "Neural",
    requires: "asreview-nemo",
    description:
      "A classifier and feature extractor combination both based on neural network architectures. Long training time and needs more data, but unrivaled performance in the final screening stages (Wide-Doc2Vec x Dynamic Neural Network).",
  },
];

const getFullModel = (model) => {
  let name =
    model.feature_extraction +
    "-" +
    model.classifier +
    "-" +
    model.query_strategy +
    "-" +
    model.balance_strategy;
  let defaultModel = DEFAULT_MODELS.filter((e) => e.name === name);

  if (defaultModel.length === 1) {
    return defaultModel[0];
  } else {
    return "custom";
  }
};

const splitFullModel = (changeValue, selectedModel = null) => {
  if (changeValue === "custom") {
    return selectedModel;
  } else {
    let parts = changeValue.split("-");
    return {
      feature_extraction: parts[0],
      classifier: parts[1],
      query_strategy: parts[2],
      balance_strategy: parts[3],
    };
  }
};

const ModelSelectDialog = ({
  open,
  handleClose,
  model,
  modelOptions,
  trainNewModel = false,
}) => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = React.useState(model);

  const handleRadioChange = (event) => {
    setSelectedModel(splitFullModel(event.target.value, selectedModel));
  };

  const { mutate, isLoading, isError } = useMutation(
    ProjectAPI.mutateModelConfig,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fetchModelConfig"] });

        handleClose(selectedModel);
      },
    },
  );

  const handleSave = () => {
    mutate({
      project_id: project_id,
      ...selectedModel,
      trainNewModel: trainNewModel,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="model-select-dialog-title"
      aria-describedby="model-select-dialog-description"
    >
      <DialogTitle id="model-select-dialog-title">Select a model</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <RadioGroup
            value={getFullModel(selectedModel).name}
            onChange={handleRadioChange}
          >
            {DEFAULT_MODELS.map((value) => (
              <FormControlLabel
                value={value.name}
                control={<Radio />}
                label={value.title}
              />
            ))}
            <FormControlLabel
              value={"custom"}
              control={<Radio />}
              label={"Custom"}
            />
            {getFullModel(selectedModel).name === "custom" && (
              <Box>
                <Stack direction="column" spacing={3}>
                  <ModelSelect
                    name="feature_extraction"
                    label="Feature extraction technique"
                    items={modelOptions?.feature_extraction}
                    model={selectedModel}
                    // handleModel={handleModelCustom}
                  />
                  <ModelSelect
                    name="classifier"
                    label="Classifier"
                    items={modelOptions?.classifier}
                    model={selectedModel}
                    // handleModel={handleModelCustom}
                  />
                  <ModelSelect
                    name="query_strategy"
                    label="Query strategy"
                    items={modelOptions?.query_strategy}
                    model={selectedModel}
                    // handleModel={handleModelCustom}
                    helperText={
                      selectedModel?.query_strategy === "random"
                        ? "Your review is not accelerated by the model"
                        : undefined
                    }
                  />
                  <ModelSelect
                    name="balance_strategy"
                    label="Balance strategy"
                    items={modelOptions?.balance_strategy}
                    model={selectedModel}
                    // handleModel={handleModelCustom}
                  />
                </Stack>
              </Box>
            )}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} autoFocus disabled={isLoading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ModelCard = ({
  editable = true,
  showWarning = false,
  trainNewModel = false,
}) => {
  const project_id = useContext(ProjectContext);

  const [modelSelect, toggleModelSelect] = useToggle();

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
    data: modelConfig,
    isLoading: isLoadingModelConfig,
    error: fetchModelConfigError,
    isError: isFetchModelConfigError,
    isFetching: isFetchingModelConfig,
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
        title="Your AI"
        subheader={
          <>
            <>Choose an AI model to accelerate your review process. </>
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
      {isLoadingModelConfig ? (
        <Skeleton sx={{ height: 140 }} animation="wave" variant="rectangular" />
      ) : (
        <CardMedia
          component="img"
          height="140"
          image={modelAlwaysGood}
          alt={"Model " + getFullModel(modelConfig).title}
        />
      )}

      {isLoadingModelConfig ? (
        <Skeleton animation="wave" variant="text" />
      ) : (
        <CardContent>{getFullModel(modelConfig).description}</CardContent>
      )}

      <CardContent>
        <Slider
          sx={{ width: 300 }}
          aria-label="Random"
          defaultValue={0}
          // getAriaValueText={(value) => {`${value}%`}}
          valueLabelDisplay="on"
          min={0}
          max={25}
        />
      </CardContent>

      <CardContent>
        <Button variant="contained" color="primary" onClick={toggleModelSelect}>
          Change
        </Button>

        {!isLoadingModelConfig && (
          <ModelSelectDialog
            open={modelSelect}
            handleClose={toggleModelSelect}
            model={modelConfig}
            modelOptions={modelOptions}
            trainNewModel={trainNewModel}
          />
        )}

        {/*
        <Stack>

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
                    : getFullModel(modelState.model).name
                }
                onChange={handleModelDropdownChange}
              >
                {DEFAULT_MODELS.map((value) => (
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
              <Box>
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
      </Stack> */}
        {/* <Dialog
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
        </Dialog> */}
        {/*
        <CardErrorHandler
          queryKey={"fetchModelOptions"}
          error={fetchModelOptionsError}
          isError={isFetchModelOptionsError}
        />
        <CardErrorHandler
          queryKey={"fetchModelConfig"}
          error={fetchModelConfigError}
          isError={isFetchModelConfigError}
        /> */}
      </CardContent>
    </Card>
  );
};

export default ModelCard;

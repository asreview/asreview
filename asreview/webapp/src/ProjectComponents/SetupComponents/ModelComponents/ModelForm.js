import * as React from "react";
import { useMutation, useQuery } from "react-query";
import { connect } from "react-redux";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "../../../Components";
import { ModelSelect } from "../ModelComponents";
import { ProjectAPI } from "../../../api/index.js";
import { defaultAlgorithms, mapStateToProps } from "../../../globals.js";
import { SelectItem } from "../../../ProjectComponents";
import { useContext } from "react";
import { ProjectContext } from "../../../ProjectContext.js";

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

const DEFAULT_MODELS = [
  {
    name: "tfidf-nb-max-double",
    title: "Model tfidf-nb-max-double",
    description:
      "Features model tfidf-nb-max-double. The best prediction is shown first.",
  },
  {
    name: "tfidf-rf-max-double",
    title: "Model tfidf-rf-max-double",
    description:
      "Features model tfidf-rf-max-double. The best prediction is shown first.",
  },
  {
    name: "sbert-nn-max-double",
    title: "Model sbert-nn-max-double",
    requires: "asreview-extra-models",
    description:
      "Features model sbert-nn-max-double. The best prediction is shown first.",
  },
  {
    name: "tfidf-nb-random-double",
    title: "Model tfidf-nb-random-double",
    description:
      "Screen records randomly. Exported records are ranked according to tfidf-nb-max-double model.",
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
  let defaultModel = DEFAULT_MODELS.filter((e) => e.name === name);

  if (defaultModel.length === 1) {
    return defaultModel[0].name;
  } else {
    return "custom";
  }
};

const ModelForm = ({ handleComplete, editable = true }) => {
  const project_id = useContext(ProjectContext);

  const [modelState, setModelState] = React.useState({
    custom: false,
    isChanged: false,
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
        });
      },
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: mutateModelConfig, isError: isMutateModelConfigError } =
    useMutation(ProjectAPI.mutateModelConfig, {
      mutationKey: "mutateModelConfig",
      onError: () => {
        handleComplete(false);
      },
      onSuccess: () => {
        handleComplete(true);
      },
    });

  const prepareMutationData = React.useCallback(
    () => ({
      project_id: project_id,
      ...modelState.model,
    }),
    [project_id, modelState],
  );

  const handleModelCustom = (event) => {
    const { name, value } = event.target;
    setModelState({
      custom: modelState.custom,
      isChanged: true,
      model: { ...modelState.model, ...{ [name]: value } },
    });
  };

  const handleModelDropdown = (event) => {
    const { value } = event.target;

    if (value === "custom") {
      setModelState({
        custom: true,
        isChanged: true,
        model: modelState.model,
      });
    } else {
      let parts = value.split("-");
      setModelState({
        custom: false,
        isChanged: true,
        model: {
          feature_extraction: parts[0],
          classifier: parts[1],
          query_strategy: parts[2],
          balance_strategy: parts[3],
        },
      });
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
                onChange={handleModelDropdown}
              >
                {/* iterater over the default models */}
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
                  Super models extension isn't installed. Please install the{" "}
                  <Link
                    underline="none"
                    href={`https://asreview.readthedocs.io/en/latest/guide/installation.html#installing-the-super-models`}
                    target="_blank"
                  >
                    {" "}
                    super models
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

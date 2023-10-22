import * as React from "react";
import { useMutation, useQuery } from "react-query";
import { connect } from "react-redux";
import { Box, CircularProgress, Link, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "../../../Components";
import { ModelRequirement, ModelSelect } from "../ModelComponents";
import { ProjectAPI } from "../../../api/index.js";
import { defaultAlgorithms, mapStateToProps } from "../../../globals.js";

const PREFIX = "ModelForm";

const classes = {
  title: `${PREFIX}-title`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 16,
  },

  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
  },
}));

const ModelForm = (props) => {
  const [model, setModel] = React.useState({
    classifier: null,
    query_strategy: null,
    balance_strategy: null,
    feature_extraction: null,
  });

  /**
   * Fetch model options
   */
  const {
    data: modelOptions,
    error: fetchModelOptionsError,
    isError: isFetchModelOptionsError,
    isFetching: isFetchingModelOptions,
  } = useQuery("fetchModelOptions", ProjectAPI.fetchModelOptions, {
    refetchOnWindowFocus: false,
  });

  /**
   * Fetch model config
   */
  const {
    error: fetchModelConfigError,
    isError: isFetchModelConfigError,
    isFetching: isFetchingModelConfig,
  } = useQuery(
    ["fetchModelConfig", { project_id: props.project_id }],
    ProjectAPI.fetchModelConfig,
    {
      enabled: props.project_id !== null,
      onSuccess: (data) => {
        setModel({
          classifier: data["model"],
          query_strategy: data["query_strategy"],
          balance_strategy: data["balance_strategy"],
          feature_extraction: data["feature_extraction"],
        });
      },
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Mutate model config
   */
  const {
    // error: mutateModelConfigError,
    // isError: isMutateModelConfigError,
    // isLoading: isMutatingModelConfig,
    mutate: mutateModelConfig,
    // reset,
  } = useMutation(ProjectAPI.mutateModelConfig, {
    mutationKey: "mutateModelConfig",
    onError: () => {
      props.handleComplete(false);
    },
    onSuccess: () => {
      props.handleComplete(true);
    },
  });

  const prepareMutationData = React.useCallback(
    () => ({
      project_id: props.project_id,
      ...model,
    }),
    [props.project_id, model],
  );

  // auto mutate model selection
  React.useEffect(() => {
    const { classifier, query_strategy, balance_strategy, feature_extraction } =
      model;

    if (
      props.project_id &&
      classifier &&
      query_strategy &&
      balance_strategy &&
      feature_extraction
    ) {
      mutateModelConfig(prepareMutationData());
    }
  }, [model, mutateModelConfig, prepareMutationData, props.project_id]);

  const handleModel = (event) => {
    const { name, value } = event.target;

    let updates = { [name]: value };

    if (name === "classifier") {
      if (["lstm-base", "lstm-pool"].includes(value)) {
        updates.feature_extraction = "embedding-lstm";
      } else if (model?.feature_extraction === "embedding-lstm") {
        updates.feature_extraction = defaultAlgorithms["feature_extraction"];
      }
    }

    setModel((prevModel) => ({
      ...prevModel,
      ...updates,
    }));
  };

  const disableClassifierItem = (value) => {
    return value === "nb" && model?.feature_extraction === "doc2vec";
  };

  const disableFeatureExtractionItem = (value) => {
    const { classifier } = model || {};

    if (value === "doc2vec" && classifier === "nb") return true;
    if (value === "embedding-lstm") {
      if (!["lstm-base", "lstm-pool"].includes(classifier)) return true;
    } else if (["lstm-base", "lstm-pool"].includes(classifier)) return true;

    return false;
  };

  const returnQueryStrategyHelperText = () => {
    if (model?.query_strategy === "random") {
      return "Your review is not accelerated by the model";
    }
  };

  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Model</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          An active learning model consists of a feature extraction technique, a
          classifier, a query strategy, and a balance strategy. The default
          setup (TF-IDF, Naive Bayes, Maximum, Dynamic resampling) overall has
          fast and excellent performance.{" "}
          <Link
            underline="none"
            href={`https://asreview.nl/blog/active-learning-explained/`}
            target="_blank"
          >
            Learn more
          </Link>
        </Typography>
      </Box>
      <ModelRequirement model={model} modelOptions={modelOptions} />
      <Stack spacing={3} sx={{ mt: 3 }}>
        {(isFetchingModelOptions || isFetchingModelConfig) && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
        {!isFetchingModelOptions && !isFetchingModelConfig && (
          <Box component="form" noValidate autoComplete="off">
            <Stack direction="column" spacing={3}>
              <ModelSelect
                name="feature_extraction"
                label="Feature extraction technique"
                items={modelOptions?.feature_extraction}
                model={model}
                handleModel={handleModel}
                disableItem={disableFeatureExtractionItem}
              />
              <ModelSelect
                name="classifier"
                label="Classifier"
                items={modelOptions?.classifier}
                model={model}
                handleModel={handleModel}
                disableItem={disableClassifierItem}
              />
              <ModelSelect
                name="query_strategy"
                label="Query strategy"
                items={modelOptions?.query_strategy}
                model={model}
                handleModel={handleModel}
                helperText={returnQueryStrategyHelperText()}
              />
              <ModelSelect
                name="balance_strategy"
                label="Balance strategy"
                items={modelOptions?.balance_strategy}
                model={model}
                handleModel={handleModel}
              />
            </Stack>
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

export default connect(mapStateToProps)(ModelForm);

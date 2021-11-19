import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../../Components";
import { InfoCard, SelectItem } from "../../SetupComponents";
import { ProjectAPI } from "../../../api/index.js";
import { defaultAlgorithms, mapStateToProps } from "../../../globals.js";

const requirements = [
  {
    value: "tensorflow",
    link: "https://asreview.readthedocs.io/en/latest/API/generated/asreview.models.classifiers.NN2LayerClassifier.html#asreview-models-classifiers-nn2layerclassifier",
  },
  {
    value: "gensim",
    link: "https://asreview.readthedocs.io/en/latest/API/generated/asreview.models.feature_extraction.Doc2Vec.html#asreview-models-feature-extraction-doc2vec",
  },
  {
    value: "sentence-transformers",
    link: "https://asreview.readthedocs.io/en/latest/API/generated/asreview.models.feature_extraction.SBERT.html#asreview-models-feature-extraction-sbert",
  },
];

const modelRequirement = (requirement) => {
  let link = requirements
    .filter((element) => element.value === requirement)
    .map((element) => element.link);
  return (
    <React.Fragment>
      requires <code>{requirement}</code> to be installed.{" "}
      <Link underline="none" href={link} target="_blank">
        Learn more
      </Link>{" "}
    </React.Fragment>
  );
};

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
  const queryClient = useQueryClient();
  const {
    data: modelOptions,
    error: fetchModelOptionsError,
    isError: isFetchModelOptionsError,
    isFetched: isFetchedModelOptions,
    isFetching: isFetchingModelOptions,
    isSuccess: isSuccessModelOptions,
  } = useQuery("fetchModelOptions", ProjectAPI.fetchModelOptions, {
    refetchOnWindowFocus: false,
  });

  const {
    error: fetchModelConfigError,
    isError: isFetchModelConfigError,
    isFetched: isFetchedModelConfig,
    isFetching: isFetchingModelConfig,
    isSuccess: isSuccessModelConfig,
  } = useQuery(
    ["fetchModelConfig", { project_id: props.project_id }],
    ProjectAPI.fetchModelConfig,
    {
      onSuccess: (data) => {
        props.setModel({
          classifier: data["model"],
          query_strategy: data["query_strategy"],
          feature_extraction: data["feature_extraction"],
        });
      },
      refetchOnWindowFocus: false,
    }
  );

  const handleModel = (event) => {
    if (event.target.name === "classifier") {
      if (
        event.target.value === "lstm-base" ||
        event.target.value === "lstm-pool"
      ) {
        props.setModel({
          ...props.model,
          classifier: event.target.value,
          feature_extraction: "embedding-lstm",
        });
      } else {
        if (props.model["feature_extraction"] === "embedding-lstm") {
          props.setModel({
            ...props.model,
            classifier: event.target.value,
            feature_extraction: defaultAlgorithms["feature_extraction"],
          });
        } else {
          props.setModel({
            ...props.model,
            classifier: event.target.value,
          });
        }
      }
    }
    if (event.target.name === "query_strategy") {
      props.setModel({
        ...props.model,
        query_strategy: event.target.value,
      });
    }
    if (event.target.name === "feature_extraction") {
      props.setModel({
        ...props.model,
        feature_extraction: event.target.value,
      });
    }
  };

  const returnRequirement = () => {
    return (
      <React.Fragment>
        Some classifiers and feature extraction techniques require additional
        dependencies.{" "}
        {(props.model["classifier"] === "nn-2-layer" ||
          props.model["feature_extraction"] === "embedding-idf" ||
          props.model["feature_extraction"] === "embedding-lstm") && (
          <React.Fragment>
            {props.model["feature_extraction"] === "tfidf" &&
              "This combination might crash on some systems with limited memory. "}
            {props.model["classifier"] === "nn-2-layer" &&
              modelOptions["classifier"]
                .filter((e) => e.name === "nn-2-layer")
                .map((e) => e.label) + " "}
            {props.model["feature_extraction"] === "embedding-idf" &&
              modelOptions["feature_extraction"]
                .filter((e) => e.name === "embedding-idf")
                .map((e) => e.label) + " "}
            {props.model["feature_extraction"] === "embedding-lstm" &&
              modelOptions["feature_extraction"]
                .filter((e) => e.name === "embedding-lstm")
                .map((e) => e.label) + " "}
            {modelRequirement("tensorflow")}
          </React.Fragment>
        )}
        {props.model["feature_extraction"] === "doc2vec" && (
          <React.Fragment>
            {modelOptions["feature_extraction"]
              .filter((e) => e.name === "doc2vec")
              .map((e) => e.label)}{" "}
            {modelRequirement("gensim")}
          </React.Fragment>
        )}
        {props.model["feature_extraction"] === "sbert" && (
          <React.Fragment>
            {modelOptions["feature_extraction"]
              .filter((e) => e.name === "sbert")
              .map((e) => e.label)}{" "}
            {modelRequirement("sentence-transformers")}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  const disableClassifierItem = (value) => {
    return value === "nb" && props.model["feature_extraction"] === "doc2vec";
  };

  const disableFeatureExtractionItem = (value) => {
    return (
      (value === "doc2vec" && props.model["classifier"] === "nb") ||
      (props.model["classifier"] !== "lstm-base" &&
        props.model["classifier"] !== "lstm-pool" &&
        value === "embedding-lstm") ||
      ((props.model["classifier"] === "lstm-base" ||
        props.model["classifier"] === "lstm-pool") &&
        value !== "embedding-lstm")
    );
  };

  const returnQueryStrategyHelperText = () => {
    if (props.model["query_strategy"] === "random") {
      return "Your review is not accelerated by the model";
    }
  };

  const returnModelError = () => {
    if (isFetchModelOptionsError && !isFetchModelConfigError) {
      return fetchModelOptionsError?.message;
    }
    if (isFetchModelConfigError && !isFetchModelOptionsError) {
      return fetchModelConfigError?.message;
    }
    if (isFetchModelOptionsError && isFetchModelConfigError) {
      return (
        fetchModelOptionsError?.message + " " + fetchModelConfigError?.message
      );
    }
  };

  const refetchModel = () => {
    if (isFetchModelOptionsError) {
      queryClient.resetQueries("fetchModelOptions");
    }
    if (isFetchModelConfigError) {
      queryClient.resetQueries("fetchModelConfig");
    }
  };

  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Model</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          An active learning model consists of a classifier, a query strategy, a
          feature extraction technique, and a balance strategy. The default
          setup (Naive Bayes, Maximum, TF-IDF) overall has fast and excellent
          performance.{" "}
          <Link
            underline="none"
            href={`https://asreview.readthedocs.io/en/latest/guides/activelearning.html#active-learning-for-systematic-reviews`}
            target="_blank"
          >
            Learn more
          </Link>
        </Typography>
      </Box>
      {returnRequirement() && <InfoCard info={returnRequirement()} />}
      <Stack spacing={3} sx={{ mt: 3 }}>
        {(isFetchingModelOptions || isFetchingModelConfig) && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
        {!isFetchModelOptionsError &&
          !isFetchModelConfigError &&
          !isFetchingModelOptions &&
          !isFetchingModelConfig &&
          isFetchedModelOptions &&
          isFetchedModelConfig &&
          isSuccessModelOptions &&
          isSuccessModelConfig && (
            <Box component="form" noValidate autoComplete="off">
              <Stack direction="column" spacing={3}>
                <FormControl fullWidth>
                  <InputLabel id="classifier-select-label">
                    Classifier
                  </InputLabel>
                  <Select
                    labelId="select-classifier-label"
                    id="select-classifier"
                    name="classifier"
                    label="Classifier"
                    value={props.model["classifier"]}
                    onChange={handleModel}
                  >
                    {modelOptions["classifier"].map((value) => {
                      return (
                        <MenuItem
                          key={`result-item-${value.name}`}
                          checked={props.model["classifier"] === value.name}
                          value={value.name}
                          disabled={disableClassifierItem(value.name)}
                        >
                          <SelectItem
                            primary={value.label}
                            secondary={value.description}
                          />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="query-strategy-select-label">
                    Query strategy
                  </InputLabel>
                  <Select
                    id="select-query-strategy"
                    name="query_strategy"
                    label="Query strategy"
                    value={props.model["query_strategy"]}
                    onChange={handleModel}
                  >
                    {modelOptions["query_strategy"].map((value) => {
                      return (
                        <MenuItem
                          key={`result-item-${value.name}`}
                          checked={props.model["query_strategy"] === value.name}
                          value={value.name}
                        >
                          <SelectItem
                            primary={value.label}
                            secondary={value.description}
                          />
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText>
                    {returnQueryStrategyHelperText()}
                  </FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="feature-extraction-select-label">
                    Feature extraction technique
                  </InputLabel>
                  <Select
                    id="select-feature-extraction"
                    name="feature_extraction"
                    label="Feature extraction technique"
                    value={props.model["feature_extraction"]}
                    onChange={handleModel}
                  >
                    {modelOptions["feature_extraction"].map((value) => {
                      return (
                        <MenuItem
                          key={`result-item-${value.name}`}
                          checked={
                            props.model["feature_extraction"] === value.name
                          }
                          value={value.name}
                          disabled={disableFeatureExtractionItem(value.name)}
                        >
                          <SelectItem
                            primary={value.label}
                            secondary={value.description}
                          />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          )}
        {(isFetchModelOptionsError || isFetchModelConfigError) && (
          <InlineErrorHandler
            message={returnModelError()}
            refetch={refetchModel}
            button="Try to refresh"
          />
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(ModelForm);

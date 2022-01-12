import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";
import { StyledTypoSubtitle1Medium } from "../../StyledComponents";
import { SelectItem } from "../SetupComponents";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const Root = styled("div")(({ theme }) => ({}));

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
    data: modelConfig,
    error: fetchModelConfigError,
    isError: isFetchModelConfigError,
    isFetched: isFetchedModelConfig,
    isFetching: isFetchingModelConfig,
    isSuccess: isSuccessModelConfig,
  } = useQuery(
    ["fetchModelConfig", { project_id: props.project_id }],
    ProjectAPI.fetchModelConfig,
    {
      enabled: props.project_id !== null,
      refetchOnWindowFocus: false,
    }
  );

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
      <Stack spacing={2}>
        <Box>
          <StyledTypoSubtitle1Medium text="Model" />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            An active learning model consists of a classifier, a query strategy,
            a feature extraction technique, and a balance strategy. The default
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
        {!isFetchModelOptionsError &&
          !isFetchModelConfigError &&
          !isFetchingModelOptions &&
          !isFetchingModelConfig &&
          isFetchedModelOptions &&
          isFetchedModelConfig &&
          isSuccessModelOptions &&
          isSuccessModelConfig && (
            <Box component="form" noValidate autoComplete="off">
              <Stack direction="column" spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="classifier-select-label">
                    Classifier
                  </InputLabel>
                  <Select
                    disabled
                    labelId="select-classifier-label"
                    id="select-classifier"
                    name="classifier"
                    label="Classifier"
                    value={modelConfig?.model}
                  >
                    {modelOptions?.classifier.map((value) => {
                      return (
                        <MenuItem
                          key={`result-item-${value.name}`}
                          checked={modelConfig?.model === value.name}
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
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="query-strategy-select-label">
                    Query strategy
                  </InputLabel>
                  <Select
                    disabled
                    id="select-query-strategy"
                    name="query_strategy"
                    label="Query strategy"
                    value={modelConfig?.query_strategy}
                  >
                    {modelOptions?.query_strategy.map((value) => {
                      return (
                        <MenuItem
                          key={`result-item-${value.name}`}
                          checked={modelConfig?.query_strategy === value.name}
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
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="feature-extraction-select-label">
                    Feature extraction technique
                  </InputLabel>
                  <Select
                    disabled
                    id="select-feature-extraction"
                    name="feature_extraction"
                    label="Feature extraction technique"
                    value={modelConfig?.feature_extraction}
                  >
                    {modelOptions?.feature_extraction.map((value) => {
                      return (
                        <MenuItem
                          key={`result-item-${value.name}`}
                          checked={
                            modelConfig?.feature_extraction === value.name
                          }
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
                </FormControl>
              </Stack>
            </Box>
          )}
        {(isFetchModelOptionsError || isFetchModelConfigError) && (
          <InlineErrorHandler
            message={returnModelError()}
            refetch={refetchModel}
            button={true}
          />
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(ModelForm);

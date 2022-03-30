import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
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
import { SelectItem } from "../../ProjectComponents";
import { MouseOverPopover } from "../../StyledComponents/StyledPopover.js";
import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";
import { ProjectAPI } from "../../api/index.js";

const Root = styled("div")(({ theme }) => ({}));

const ModelForm = (props) => {
  const { project_id } = useParams();
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
    ["fetchModelConfig", { project_id }],
    ProjectAPI.fetchModelConfig,
    {
      enabled: project_id !== null,
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
      <Stack spacing={3}>
        <Box>
          <TypographySubtitle1Medium>Model</TypographySubtitle1Medium>
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
              <Stack direction="column" spacing={3}>
                <MouseOverPopover title="Select classifier when creating a new project">
                  <FormControl disabled fullWidth variant="filled">
                    <InputLabel id="classifier-select-label">
                      Classifier
                    </InputLabel>
                    <Select
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
                </MouseOverPopover>
                <MouseOverPopover title="Select query strategy when creating a new project">
                  <FormControl disabled fullWidth variant="filled">
                    <InputLabel id="query-strategy-select-label">
                      Query strategy
                    </InputLabel>
                    <Select
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
                </MouseOverPopover>
                <MouseOverPopover title="Select feature extraction technique when creating a new project">
                  <FormControl disabled fullWidth variant="filled">
                    <InputLabel id="feature-extraction-select-label">
                      Feature extraction technique
                    </InputLabel>
                    <Select
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
                </MouseOverPopover>
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

export default ModelForm;

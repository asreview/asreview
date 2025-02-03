import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid2 as Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { DoneOutlined, ExpandMore } from "@mui/icons-material";

import { styled } from "@mui/material/styles";

import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { useToggle } from "hooks/useToggle";
import { useContext } from "react";
import { projectModes } from "globals.js";

const DEFAULT_MODELS = [
  {
    name: "tfidf-nb",
    title: "RapidElas",
    description:
      "RapidElas is a classic combination that has proven to work well in the ASReview context, as shown in many simulations. It especially handles the starting phase of the systematic review well, being able to handle little amounts of data.",
  },
  {
    name: "onehot-logistic",
    title: "OneWord",
    description:
      "A model that excels in finding specific words, providing good performance in finding the last remaining relevant documents.",
  },
  {
    name: "labse-logistic",
    title: "MultiLanguage",
    requires: "asreview-nemo",
    description:
      "A multilingual feature extractor for systematic review datasets in multiple languages (LaBSE x Logistic Regression).",
  },
  {
    name: "sbert-rf",
    title: "Context",
    requires: "asreview-nemo",
    description:
      "A powerful pretrained model based on the transformer infrastructure used in the latest AI models. Combined with a proven implementation of a gradient boosting classifier (SBert x XGBoost).",
  },
  {
    name: "doc2vec-dynamic_nn",
    title: "Neural",
    requires: "asreview-nemo",
    description:
      "A classifier and feature extractor combination both based on neural network architectures. Long training time and needs more data, but unrivaled performance in the final screening stages (Wide-Doc2Vec x Dynamic Neural Network).",
  },
];

const ExpandMoreButton = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  transform: "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: "rotate(0deg)",
      },
    },
  ],
}));

const getFullModel = (model) => {
  let name = model.feature_extractor + "-" + model.classifier;
  let defaultModel = DEFAULT_MODELS.filter((e) => e.name === name);

  if (defaultModel.length === 1) {
    return defaultModel[0];
  } else {
    return "custom";
  }
};

const ModelSelect = ({
  name,
  label,
  items,
  model,
  handleModel,
  disableItem,
  helperText,
  editable = true,
}) => (
  <FormControl>
    <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
    <Select
      id={`select-${name}`}
      name={name}
      label={label}
      value={model?.[name] ? model[name] : ""}
      onChange={handleModel}
      disabled={!editable}
    >
      {items.map((value) => (
        <MenuItem
          key={`result-item-${value.name}`}
          checked={model?.[name] === value.name}
          value={value.name}
          disabled={disableItem ? disableItem(value.name) : false}
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

const ModelSelectDialog = ({
  open,
  handleClose,
  model,
  modelOptions,
  trainNewModel = false,
}) => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = React.useState({
    name: model.feature_extractor + "-" + model.classifier,
    ...model,
  });

  const handleRadioChange = (event) => {
    if (event.target.value !== "custom") {
      let parts = event.target.value.split("-");
      setSelectedModel({
        ...selectedModel,
        name: event.target.value,
        feature_extractor: parts[0],
        classifier: parts[1],
      });
    } else {
      setSelectedModel({
        ...selectedModel,
        name: "custom",
      });
    }
  };

  const { mutate, isLoading } = useMutation(ProjectAPI.mutateModelConfig, {
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["fetchModelConfig", { project_id: project_id }],
        data,
      );
      handleClose();
    },
  });

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
          <RadioGroup value={selectedModel.name} onChange={handleRadioChange}>
            <FormControlLabel
              value={"tfidf-nb"}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="h6">RapidElas</Typography>
                  <Typography paragraph>
                    A simple feature extractor with Naive Bayes. This model is
                    fast and efficient for rapid screening.
                  </Typography>
                </Box>
              }
              key="tfidf-nb"
            />
            <FormControlLabel
              value={"onehot-logistic"}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="h6">OneWord</Typography>
                  <Typography paragraph>
                    An onehot feature extractor with logistic regression. This
                    model is good at finding specific words.
                  </Typography>
                </Box>
              }
              key="onehot-logistic"
            />
            <FormControlLabel
              value={"labse-logistic"}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="h6">
                    MultiLanguage{" "}
                    <Typography
                      color="secondary"
                      sx={{ display: "inline", fontSize: "80%" }}
                    >
                      part of asreview-nemo
                    </Typography>
                  </Typography>
                  <Typography paragraph>
                    A Labse feature extractor with logistic regression. This
                    model is good at handling multiple languages.
                  </Typography>
                </Box>
              }
              key="labse-logistic"
              disabled={
                modelOptions?.feature_extractor.find(
                  (v) => v.name === "labse",
                ) === undefined
              }
            />
            <FormControlLabel
              value={"sbert-rf"}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="h6">
                    Context{" "}
                    <Typography
                      color="secondary"
                      sx={{ display: "inline", fontSize: "80%" }}
                    >
                      part of asreview-nemo
                    </Typography>
                  </Typography>
                  <Typography paragraph>
                    A SBert feature extractor with random forest. This model is
                    good at handling deeper context.
                  </Typography>
                </Box>
              }
              key="sbert-rf"
              disabled={
                modelOptions?.classifier.find((v) => v.name === "sbert") ===
                undefined
              }
            />
            <FormControlLabel
              value={"doc2vec-dynamic_nn"}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="h6">
                    Neural{" "}
                    <Typography
                      color="secondary"
                      sx={{ display: "inline", fontSize: "80%" }}
                    >
                      part of asreview-nemo
                    </Typography>
                  </Typography>
                  <Typography paragraph>
                    A Doc2Vec feature extractor with neural network. This model
                    handles complex data better.
                  </Typography>
                </Box>
              }
              key="doc2vec-dynamic_nn"
              disabled={
                modelOptions?.classifier.find(
                  (v) => v.name === "dynamic_nn",
                ) === undefined ||
                modelOptions?.feature_extractor.find(
                  (v) => v.name === "doc2vec",
                ) === undefined
              }
            />
            <FormControlLabel
              value={"custom"}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="h6">Custom</Typography>
                  <Typography paragraph>
                    Craft your own model with a feature extractor and
                    classifier.
                  </Typography>
                </Box>
              }
              key="custom"
            />
            {selectedModel.name === "custom" && (
              <Box>
                <Stack direction="column" spacing={3}>
                  <ModelSelect
                    name="feature_extractor"
                    label="Feature extraction technique"
                    items={modelOptions?.feature_extractor}
                    model={selectedModel}
                    handleModel={(event) => {
                      setSelectedModel({
                        ...selectedModel,
                        feature_extractor: event.target.value,
                      });
                    }}
                  />
                  <ModelSelect
                    name="classifier"
                    label="Classifier"
                    items={modelOptions?.classifier}
                    model={selectedModel}
                    handleModel={(event) => {
                      setSelectedModel({
                        ...selectedModel,
                        classifier: event.target.value,
                      });
                    }}
                  />
                </Stack>
              </Box>
            )}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            mutate({
              project_id: project_id,
              ...selectedModel,
              trainNewModel: trainNewModel,
            });
          }}
          autoFocus
          disabled={isLoading}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ModelCard = ({
  mode = null,
  editable = true,
  showWarning = false,
  trainNewModel = false,
}) => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const [modelSelect, toggleModelSelect] = useToggle();

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const {
    data: modelOptions,
    // error: fetchModelOptionsError,
    // isError: isFetchModelOptionsError,
    // isFetching: isFetchingModelOptions,
  } = useQuery("fetchModelOptions", ProjectAPI.fetchModelOptions, {
    refetchOnWindowFocus: false,
  });

  const {
    mutate,
    isLoading: isLoadingMutate,
    isSuccess: isSuccessMutate,
  } = useMutation(ProjectAPI.mutateModelConfig, {
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["fetchModelConfig", { project_id: project_id }],
        data,
      );
    },
  });

  const {
    data: modelConfig,
    isLoading: isLoadingModelConfig,
    // error: fetchModelConfigError,
    // isError: isFetchModelConfigError,
    // isFetching: isFetchingModelConfig,
    // isSuccess: isSuccessModelConfig,
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
        title="AI model"
        subheader={
          <>
            <>
              {projectModes.SIMULATION === mode
                ? "Compose an AI model to simulate the performance of your review process."
                : "Compose an AI model to accelerate your review process."}
            </>
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
        <Skeleton animation="wave" variant="text" />
      ) : (
        <CardContent>
          <Typography variant="h6">
            {getFullModel(modelConfig).title}
          </Typography>
          <Typography paragraph>
            {"The  model consists of a"}{" "}
            {
              modelOptions?.feature_extractor.find(
                (v) => v.name === modelConfig.feature_extractor,
              )?.label
            }{" "}
            {"feature extractor and a"}{" "}
            {
              modelOptions?.classifier.find(
                (v) => v.name === modelConfig.classifier,
              )?.label
            }{" "}
            {"classifier. "}
            {getFullModel(modelConfig).description}{" "}
          </Typography>
        </CardContent>
      )}

      {!isLoadingModelConfig && (
        <ModelSelectDialog
          open={modelSelect}
          handleClose={toggleModelSelect}
          model={modelConfig}
          modelOptions={modelOptions}
          trainNewModel={trainNewModel}
        />
      )}
      <CardContent>
        <Button
          variant="contained"
          color="primary"
          onClick={toggleModelSelect}
          disabled={!editable}
        >
          Change
        </Button>
        <ExpandMoreButton
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          sx={{ float: "right" }}
        >
          <ExpandMore />
        </ExpandMoreButton>
      </CardContent>

      <Collapse in={expanded} timeout="auto">
        <Divider />
        <CardContent>
          <Typography variant="h6">Query method</Typography>
          <Typography paragraph>
            Query strategies determine which records are presented to you for
            labeling. The query strategy can have a large impact on the
            efficiency of your review.
          </Typography>

          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <FormControl sx={{ m: 1, minWidth: 240 }}>
              <InputLabel id="select-query">Query strategy</InputLabel>
              <Select
                labelId="select-query"
                id="select-query"
                value={modelConfig?.querier}
                label="Query strategy"
                onChange={(event) => {
                  mutate({
                    project_id: project_id,
                    ...modelConfig,
                    querier: event.target.value,
                    trainNewModel: trainNewModel,
                  });
                }}
                disabled={isLoadingMutate || !editable}
              >
                {modelOptions?.querier.map((value) => (
                  <MenuItem value={value.name} key={value.name}>
                    {value.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isLoadingMutate && <CircularProgress size={"1.5rem"} />}
            {isSuccessMutate && <DoneOutlined color="success" />}
          </Grid>
        </CardContent>
        <Divider />
        <CardContent>
          <Typography variant="h6">Show random records</Typography>
          <Typography paragraph>
            Present a small percentage of randomly selected records from your
            dataset during your review. In some cases, this can help to find
            isolated clusters of relevant records.
          </Typography>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ pt: 2 }}
          >
            {" "}
            <Slider
              sx={{ maxWidth: "500px" }}
              aria-label="Random"
              defaultValue={0}
              // getAriaValueText={(value) => {`${value}%`}}
              valueLabelDisplay="on"
              min={0}
              max={25}
              disabled={!editable}
            />
            <Alert severity="info">
              Coming soon! Keep an eye on our website and socials.
            </Alert>
          </Grid>
        </CardContent>
        <Divider />
        <CardContent>
          <Typography variant="h6">Balance method</Typography>
          <Typography paragraph>
            The balance strategy determines how the model deals with the
            imbalance between relevant and irrelevant records. This can be
            important when the number of relevant records is small compared to
            the number of irrelevant records.
          </Typography>
          <Box sx={{ px: 2, paddingTop: 2 }}>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <FormControl sx={{ m: 1, minWidth: 240 }}>
                <InputLabel id="select-balance">Balance strategy</InputLabel>
                <Select
                  labelId="select-balance"
                  id="select-balance"
                  value={modelConfig?.balancer}
                  label="Balance strategy"
                  onChange={(event) => {
                    mutate({
                      project_id: project_id,
                      ...modelConfig,
                      balancer: event.target.value,
                      trainNewModel: trainNewModel,
                    });
                  }}
                  disabled={isLoadingMutate || !editable}
                >
                  <MenuItem value="" key="none">
                    <em>None</em>
                  </MenuItem>

                  {modelOptions?.balancer.map((value) => (
                    <MenuItem value={value.name} key={value.name}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {isLoadingMutate && <CircularProgress size={"1.5rem"} />}
              {isSuccessMutate && <DoneOutlined color="success" />}
            </Grid>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ModelCard;

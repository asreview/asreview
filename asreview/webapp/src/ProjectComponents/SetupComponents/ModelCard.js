import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { styled } from "@mui/material/styles";

import { SelectItem } from "ProjectComponents";
import { ProjectContext } from "ProjectContext";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";
import { useContext } from "react";

const DEFAULT_MODELS = [
  {
    name: "tfidf-nb-max-double",
    title: "AlwaysGood",
    description:
      "AlwaysGood is a classic combination that has proven to work well in the ASReview context, as shown in many simulations. It especially handles the starting phase of the systematic review well, being able to handle little amounts of data.",
  },
  {
    name: "onehot-logistic-max-double",
    title: "OneWord",
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

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

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
      value={model?.[name]}
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
          <SelectItem primary={value.label} secondary={value.description} />
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

  const [selectedModel, setSelectedModel] = React.useState(model);

  const handleRadioChange = (event) => {
    setSelectedModel(splitFullModel(event.target.value, selectedModel));
  };

  const { mutate, isLoading } = useMutation(ProjectAPI.mutateModelConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchModelConfig"] });

      handleClose(selectedModel);
    },
  });

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

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // const [modelState, setModelState] = React.useState({
  //   custom: false,
  //   isChanged: false,
  //   warning: {
  //     active: false,
  //     value: null,
  //   },
  //   model: defaultAlgorithms,
  // });

  const {
    data: modelOptions,
    // error: fetchModelOptionsError,
    // isError: isFetchModelOptionsError,
    // isFetching: isFetchingModelOptions,
  } = useQuery("fetchModelOptions", ProjectAPI.fetchModelOptions, {
    refetchOnWindowFocus: false,
  });

  const {
    data: modelConfig,
    isLoading: isLoadingModelConfig,
    // error: fetchModelConfigError,
    // isError: isFetchModelConfigError,
    // isFetching: isFetchingModelConfig,
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
          // component="img"
          height="140"
          // image={modelAlwaysGood}
          alt={"Model " + getFullModel(modelConfig).title}
          sx={{ bgcolor: `primary.background` }}
        />
      )}

      {isLoadingModelConfig ? (
        <Skeleton animation="wave" variant="text" />
      ) : (
        <CardContent>
          <Typography variant="h6">
            {getFullModel(modelConfig).title}
          </Typography>
          <Typography paragraph>
            {getFullModel(modelConfig).description}{" "}
            {" The model consists of the following components:"}
          </Typography>

          <Stack spacing={1} alignItems="center">
            <Stack direction="row" spacing={1}>
              <Tooltip title="Feature extraction">
                <Chip
                  avatar={<Avatar>F</Avatar>}
                  label={modelConfig.feature_extraction}
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
              <Tooltip title="Classifier">
                <Chip
                  avatar={<Avatar>C</Avatar>}
                  label={modelConfig.classifier}
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
              <Tooltip title="Query strategy">
                <Chip
                  avatar={<Avatar>Q</Avatar>}
                  label={modelConfig.query_strategy}
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
              <Tooltip title="Balance strategy">
                <Chip
                  avatar={<Avatar>B</Avatar>}
                  label={modelConfig.balance_strategy}
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
            </Stack>
          </Stack>
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
        <Button variant="contained" color="primary" onClick={toggleModelSelect}>
          Change
        </Button>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          sx={{ float: "right" }}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          <Typography variant="h6">Randomness level</Typography>
          <Typography paragraph>
            Present a small percentage of randomly selected records from your
            dataset during your review. This might help to find relevant records
            that are not found by the AI model.
          </Typography>
          <Box sx={{ px: 2, paddingTop: 2 }}>
            <Slider
              sx={{ maxWidth: "500px" }}
              aria-label="Random"
              defaultValue={0}
              // getAriaValueText={(value) => {`${value}%`}}
              valueLabelDisplay="on"
              min={0}
              max={25}
            />
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ModelCard;

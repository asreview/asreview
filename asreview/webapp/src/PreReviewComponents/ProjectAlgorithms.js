import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Box,
  Typography,
  Grid,
  Paper,
  Link,
  CardHeader,
  CardContent,
  Tooltip,
  IconButton,
  Grow,
  TextField,
  MenuItem,
} from "@mui/material";
import { brown } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import HelpIcon from "@mui/icons-material/Help";
import EditIcon from "@mui/icons-material/Edit";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";

import { Help, useHelp } from "../PreReviewComponents";
import { ProjectAPI } from "../api/index.js";
import { defaultAlgorithms } from "../globals.js";

import "./ReviewZone.css";

const PREFIX = "ProjectAlgorithms";

const classes = {
  root: `${PREFIX}-root`,
  alert: `${PREFIX}-alert`,
  listTitle: `${PREFIX}-listTitle`,
  avatar: `${PREFIX}-avatar`,
  link: `${PREFIX}-link`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.root}`]: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "30ch",
    },
  },

  [`& .${classes.alert}`]: {
    // marginTop: theme.spacing(1),
    marginLeft: theme.spacing(7),
    marginRight: theme.spacing(7),
  },

  [`& .${classes.listTitle}`]: {
    paddingLeft: "18px",
  },

  [`& .${classes.avatar}`]: {
    color: theme.palette.getContrastText(brown[500]),
    backgroundColor: brown[500],
  },

  [`& .${classes.link}`]: {
    paddingLeft: "3px",
  },
}));

const ProjectAlgorithms = ({ project_id, scrollToBottom }) => {
  const [state, setState] = useState({
    edit: false,
  });

  const [algorithms, setAlgorithms] = useState(null);
  const [algorithmsLabel, setAlgorithmsLabel] = useState(null);

  // help button
  const [help, openHelp, closeHelp] = useHelp();

  const editAlgorithms = () => {
    setState({
      edit: true,
    });
  };

  const restoreDefaultAlgorithms = () => {
    setAlgorithms({
      ...algorithms,
      model: defaultAlgorithms["model"],
      query_strategy: defaultAlgorithms["query_strategy"],
      feature_extraction: defaultAlgorithms["feature_extraction"],
    });
    setState({
      edit: false,
    });
  };

  const handleClassifierChange = (event) => {
    if (
      event.target.value === "lstm-base" ||
      event.target.value === "lstm-pool"
    ) {
      setAlgorithms({
        ...algorithms,
        model: event.target.value,
        feature_extraction: "embedding-lstm",
      });
    } else {
      if (algorithms["feature_extraction"] === "embedding-lstm") {
        setAlgorithms({
          ...algorithms,
          model: event.target.value,
          feature_extraction: defaultAlgorithms["feature_extraction"],
        });
      } else {
        setAlgorithms({
          ...algorithms,
          model: event.target.value,
        });
      }
    }
  };

  const handleQueryStrategyChange = (event) => {
    setAlgorithms({
      ...algorithms,
      query_strategy: event.target.value,
    });
  };

  const handleFeatureExtractionChange = (event) => {
    setAlgorithms({
      ...algorithms,
      feature_extraction: event.target.value,
    });
  };

  const fetchAlgorithmsList = useCallback(() => {
    ProjectAPI.algorithms_list()
      .then((result) => {
        setAlgorithmsLabel(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const fetchAlgorithmsSettings = useCallback(async () => {
    ProjectAPI.algorithms(project_id, false)
      .then((result) => {
        setAlgorithms(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [project_id]);

  const updateAlgorithmsSettings = useCallback(() => {
    var bodyFormData = new FormData();
    bodyFormData.set("model", algorithms.model);
    bodyFormData.set("query_strategy", algorithms.query_strategy);
    bodyFormData.set("feature_extraction", algorithms.feature_extraction);

    ProjectAPI.algorithms(project_id, true, bodyFormData)
      .then((result) => {
        // nothing to do
      })
      .catch((error) => {
        console.log(error);
      });
  }, [algorithms, project_id]);

  // send an update to the server on a model change
  useEffect(() => {
    if (algorithms) {
      updateAlgorithmsSettings();
    }
  }, [algorithms, updateAlgorithmsSettings]);

  // if the state is lock, then fetch the data
  useEffect(() => {
    if (!algorithmsLabel) {
      fetchAlgorithmsList();
    } else {
      fetchAlgorithmsSettings();
    }
  }, [algorithmsLabel, fetchAlgorithmsList, fetchAlgorithmsSettings]);

  return (
    <StyledBox>
      <Grow in={true}>
        <Paper className="Card">
          <CardHeader
            /* Algorithms card */
            title="Select Active learning model"
            titleTypographyProps={{ color: "primary" }}
            /* The edit and help options */
            action={
              <Box>
                {!state.edit && (
                  <Tooltip title="Edit">
                    <IconButton
                      aria-label="project-algorithms-edit"
                      onClick={editAlgorithms}
                      size="large"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {state.edit && (
                  <Tooltip title="Restore default">
                    <span>
                      <IconButton
                        onClick={restoreDefaultAlgorithms}
                        aria-label="project-algorithms-restore-default"
                        disabled={
                          algorithms["model"] === defaultAlgorithms["model"] &&
                          algorithms["query_strategy"] ===
                            defaultAlgorithms["query_strategy"] &&
                          algorithms["feature_extraction"] ===
                            defaultAlgorithms["feature_extraction"]
                        }
                        size="large"
                      >
                        <SettingsBackupRestoreIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                <Tooltip title="Help">
                  <IconButton
                    onClick={openHelp}
                    aria-label="project-algorithms-help"
                    size="large"
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />

          {state.edit && (
            <Box>
              {/*Warning message*/}
              <div className={classes.alert}>
                <Alert severity="warning">
                  Some combinations may have incompatibility issues.
                </Alert>
              </div>
              {algorithms["model"] === "nn-2-layer" &&
                algorithms["feature_extraction"] === "tfidf" && (
                  <div className={classes.alert}>
                    <Alert severity="warning">
                      This combination might crash on some systems with limited
                      memory.
                    </Alert>
                  </div>
                )}
              {algorithms["query_strategy"] === "random" && (
                <div className={classes.alert}>
                  <Alert severity="warning">
                    Random query strategy means your review is not going to be
                    accelerated by ASReview.
                  </Alert>
                </div>
              )}

              {/*Dependency info*/}
              {(algorithms["model"] === "lstm-base" ||
                algorithms["model"] === "lstm-pool" ||
                algorithms["model"] === "nn-2-layer" ||
                algorithms["feature_extraction"] === "embedding-idf" ||
                algorithms["feature_extraction"] === "embedding-lstm") && (
                <div className={classes.alert}>
                  <Alert severity="info">
                    <Link
                      className={classes.link}
                      href="https://www.tensorflow.org/"
                      target="_blank"
                    >
                      <code>tensorflow</code>
                    </Link>{" "}
                    installation required (<code>pip install tensorflow</code>).
                  </Alert>
                </div>
              )}
              {algorithms !== null &&
                algorithms["feature_extraction"] === "doc2vec" && (
                  <div className={classes.alert}>
                    <Alert severity="info">
                      <Link
                        className={classes.link}
                        href="https://radimrehurek.com/gensim/"
                        target="_blank"
                      >
                        <code>gensim</code>
                      </Link>{" "}
                      installation required (<code>pip install gensim</code>).
                    </Alert>
                  </div>
                )}
              {algorithms !== null &&
                algorithms["feature_extraction"] === "sbert" && (
                  <div className={classes.alert}>
                    <Alert severity="info">
                      <Link
                        className={classes.link}
                        href="https://www.sbert.net/"
                        target="_blank"
                      >
                        <code>sentence-transformers</code>
                      </Link>{" "}
                      installation required (
                      <code>pip install sentence-transformers</code>).
                    </Alert>
                  </div>
                )}

              {/*Select active learning model*/}
              <CardContent className="cardHighlight">
                {algorithms !== null && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <form
                        className={classes.root}
                        noValidate
                        autoComplete="off"
                      >
                        <div>
                          <TextField
                            id="select-classifier"
                            select
                            label="Classifier"
                            value={algorithms.model}
                            onChange={handleClassifierChange}
                          >
                            {algorithmsLabel["classifier"].map((value) => {
                              return (
                                <MenuItem
                                  key={`result-item-${value.name}`}
                                  checked={algorithms["model"] === value.name}
                                  value={value.name}
                                  color="default"
                                  disabled={
                                    value.name === "nb" &&
                                    algorithms["feature_extraction"] ===
                                      "doc2vec"
                                  }
                                >
                                  {value.label}
                                </MenuItem>
                              );
                            })}
                          </TextField>

                          <TextField
                            id="select-query-strategy"
                            select
                            label="Query strategy"
                            value={algorithms.query_strategy}
                            onChange={handleQueryStrategyChange}
                          >
                            {algorithmsLabel["query_strategy"].map((value) => {
                              return (
                                <MenuItem
                                  key={`result-item-${value.name}`}
                                  checked={
                                    algorithms["query_strategy"] === value.name
                                  }
                                  value={value.name}
                                  color="default"
                                >
                                  {value.label}
                                </MenuItem>
                              );
                            })}
                          </TextField>

                          <TextField
                            id="select-feature-extraction"
                            select
                            label="Feature extraction technique"
                            value={algorithms.feature_extraction}
                            onChange={handleFeatureExtractionChange}
                          >
                            {algorithmsLabel["feature_extraction"].map(
                              (value) => {
                                return (
                                  <MenuItem
                                    key={`result-item-${value.name}`}
                                    checked={
                                      algorithms["feature_extraction"] ===
                                      value.name
                                    }
                                    value={value.name}
                                    color="default"
                                    disabled={
                                      (value.name === "doc2vec" &&
                                        algorithms["model"] === "nb") ||
                                      (algorithms["model"] !== "lstm-base" &&
                                        algorithms["model"] !== "lstm-pool" &&
                                        value.name === "embedding-lstm") ||
                                      ((algorithms["model"] === "lstm-base" ||
                                        algorithms["model"] === "lstm-pool") &&
                                        value.name !== "embedding-lstm")
                                    }
                                  >
                                    {value.label}
                                  </MenuItem>
                                );
                              }
                            )}
                          </TextField>
                        </div>
                      </form>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Box>
          )}

          {!state.edit && algorithms !== null && (
            <Box>
              <CardContent className="cardHighlight">
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="h5" noWrap={true} align="right">
                      Classifier:
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h5" align="left">
                      {
                        algorithmsLabel.classifier.find(
                          (m) => m.name === algorithms["model"]
                        ).label
                      }
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h5" noWrap={true} align="right">
                      Query strategy:
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h5" align="left">
                      {
                        algorithmsLabel.query_strategy.find(
                          (m) => m.name === algorithms["query_strategy"]
                        ).label
                      }
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h5" noWrap={true} align="right">
                      Feature extraction:
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h5" align="left">
                      {
                        algorithmsLabel.feature_extraction.find(
                          (m) => m.name === algorithms["feature_extraction"]
                        ).label
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Box>
          )}
        </Paper>
      </Grow>

      <Help
        open={help}
        onClose={closeHelp}
        title="Active learning model"
        message={
          <Box>
            <Typography variant="body2" gutterBottom>
              An
              <Link
                className={classes.link}
                href="https://asreview.readthedocs.io/en/latest/API/cli.html#feature-extraction"
                target="_blank"
              >
                active learning model
              </Link>{" "}
              consists of a classifier, a query strategy, a feature extraction
              technique, and a balance strategy. The default setup (Naive Bayes,
              TF-IDF, Maximum) overall has fast and excellent performance.
            </Typography>
            <Typography variant="body2" gutterBottom>
              Some classifiers and feature extraction techniques require
              additional dependencies. Use{" "}
              <code>pip install asreview[all]</code> to install all additional
              dependencies at once.
            </Typography>
          </Box>
        }
      />
    </StyledBox>
  );
};

export default ProjectAlgorithms;

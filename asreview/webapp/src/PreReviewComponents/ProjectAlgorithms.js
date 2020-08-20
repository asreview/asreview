import React, { useEffect } from 'react';
import {
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
} from '@material-ui/core';

import Alert from '@material-ui/lab/Alert';

import { brown } from '@material-ui/core/colors';

import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';

import {
  Help,
  useHelp,
} from '../PreReviewComponents';

import axios from 'axios';

import { api_url } from '../globals.js';

import { makeStyles } from '@material-ui/core/styles';

import './ReviewZone.css';


const useStyles = makeStyles(theme => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: "30ch",
    }
  },
  alert: {
    // marginTop: theme.spacing(1),
    marginLeft: theme.spacing(7),
    marginRight: theme.spacing(7),
  },
  listTitle: {
    paddingLeft: "18px",
  },
  avatar: {
    color: theme.palette.getContrastText(brown[500]),
    backgroundColor: brown[500],
  },
  link: {
    paddingLeft: "3px",
  },
}));

const ProjectAlgorithms = ({project_id, edit, scrollToBottom}) => {
  const classes = useStyles();

  // the state contains new attribute to check for old  data
  // or not as well as an edit attribute.
  const [state, setState] = React.useState({
    // open card in edit mode or not
    edit: (edit === undefined) ? true : edit,
  });

  const [algorithms, setAlgorithms] = React.useState(null);

  // help button
  const [help, openHelp, closeHelp] = useHelp();

  // algorithm change
  const handleAlgorithmChange = (event) => {

    // set the algorithms state
    setAlgorithms({
      ...algorithms,
      model: event.target.value,
    });

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

  // send an update to the server on a model change
  useEffect(() => {

    if (algorithms !== null){
        var bodyFormData = new FormData();
        bodyFormData.set("model", algorithms.model);
        bodyFormData.set("query_strategy", algorithms.query_strategy);
        bodyFormData.set("feature_extraction", algorithms.feature_extraction);

        axios({
          method: "post",
          url: api_url + "project/" + project_id + "/algorithms",
          data: bodyFormData,
          headers: {'Content-Type': 'multipart/form-data' }
        })
        .then(function (response) {
          // nothing to do

        })
        .catch(function (response) {
            //handle error
            // setError(true);
        });
    }

  }, [algorithms, project_id]);

  // if the state is lock, then fetch the data
  useEffect(() => {

    // fetch algorithms info
    const fetchAlgorithmsSettings = async () => {

      // contruct URL
      const url = api_url + "project/" + project_id + "/algorithms";

      axios.get(url)
        .then((result) => {
          setAlgorithms(result.data);
          setState({
            edit: state.edit,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    };

    // scroll into view
    scrollToBottom();

    fetchAlgorithmsSettings();

  }, [state.edit, project_id, scrollToBottom]);

  return (
    <Box>
      <Grow in={true}>
        <Paper className="Card">
          <Box>
            <CardHeader

              /* Algorithms card */
              title="Select Active learning model"
              titleTypographyProps={{"color": "primary"}}

              /* The edit and help options */
              action={
                <Box>
                {!state.edit &&
                  <Tooltip title="Edit">

                    <IconButton
                      aria-label="project-algorithms-edit"
                      onClick={() => {}}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                }

                <Tooltip title="Help">

                <IconButton
                  onClick={openHelp}
                  aria-label="project-algorithms-help"
                >
                  <HelpIcon />
                </IconButton>
                </Tooltip>
                </Box>
              }
            />
            
            {algorithms !== null && algorithms["feature_extraction"] === "doc2vec" &&
            <div className={classes.alert}>
              <Alert severity="info">
                Doc2Vec requires the gensim package. Tap the help icon for more information.
              </Alert>
            </div>
            }

            <CardContent className="cardHighlight">
              {algorithms !== null &&
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <form className={classes.root} noValidate autoComplete="off">
                      <div>
                        <TextField
                          id="select-classifier"
                          select
                          label="Classifier"
                          value={algorithms.model}
                          onChange={handleAlgorithmChange}
                        >
                          <MenuItem
                            checked={algorithms["model"] === "nb"}
                            value="nb"
                            color="default"
                            disabled={algorithms["feature_extraction"] === "doc2vec"}
                          >
                            {"Naïve Bayes (default)"}
                          </MenuItem>

                          <MenuItem
                            checked={algorithms["model"] === "svm"}
                            value="svm"
                            color="default"
                          >
                            {"Support vector machines"}
                          </MenuItem>

                          <MenuItem
                            checked={algorithms["model"] === "logistic"}
                            value="logistic"
                            color="default"
                          >
                            {"Logistic regression"}
                          </MenuItem>

                          <MenuItem
                            checked={algorithms["model"] === "rf"}
                            value="rf"
                            color="default"
                          >
                            {"Random forest"}
                          </MenuItem>
                        </TextField>
                        <TextField
                          id="select-feature-extraction"
                          select
                          label="Feature extraction technique"
                          value={algorithms.feature_extraction}
                          onChange={handleFeatureExtractionChange}
                        >
                          <MenuItem
                            checked={algorithms["feature_extraction"] === "tfidf"}
                            value="tfidf"
                            color="default"
                          >
                            {"tf-idf (default)"}
                          </MenuItem>

                          <MenuItem
                            checked={algorithms["feature_extraction"] === "doc2vec"}
                            value="doc2vec"
                            color="default"
                            disabled={algorithms["model"] === "nb"}
                          >
                            {"Doc2Vec"}
                          </MenuItem>
                        </TextField>

                        <TextField
                          id="select-query-strategy"
                          select
                          label="Query strategy"
                          value={algorithms.query_strategy}
                          onChange={handleQueryStrategyChange}
                        >
                          <MenuItem
                            checked={algorithms["query_strategy"] === "max"}
                            value="max"
                            color="default"
                          >
                            {"Max (default)"}
                          </MenuItem>

                          <MenuItem
                            checked={algorithms["query_strategy"] === "random"}
                            value="random"
                            color="default"
                          >
                            {"Random"}
                          </MenuItem>

                          <MenuItem
                            checked={algorithms["query_strategy"] === "max_random"}
                            value="max_random"
                            color="default"
                          >
                            {"Mixed"}
                          </MenuItem>
                        </TextField>
                      </div>
                    </form>
                  </Grid>
                </Grid>
              }
              </CardContent>
              </Box>
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
                href="https://asreview.readthedocs.io/en/latest/models.html#active-learning-algorithms"
                target="_blank"
              >active learning model
              </Link> consists of a classifier, a feature extraction technique, a query strategy, and a balance strategy.
              The default setup (Naïve Bayes, tf-idf, Max) overall has fast and excellent performance.
            </Typography>
            <Typography variant="body2" gutterBottom>
              Note: Doc2Vec is provided by the gensim package which needs to be installed manually. Follow the 
              <Link
                className={classes.link}
                href="https://asreview.readthedocs.io/en/latest/models.html#doc2vec"
                target="_blank"
              >instruction
              </Link> before using it.
            </Typography>
          </Box>
        }
      />
    </Box>
  )
}

export default ProjectAlgorithms;

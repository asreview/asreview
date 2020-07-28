import React, {useEffect} from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Link,
  List,
  ListItem,
  ListItemText,
  Radio,
  CardHeader,
  Tooltip,
  IconButton,
  Grow,
} from '@material-ui/core'

import { brown } from '@material-ui/core/colors';

import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';

import {
  Help,
  useHelp,
} from '../PreReviewComponents'

import axios from 'axios'

import { api_url } from '../globals.js';

import { makeStyles } from '@material-ui/core/styles';

import './ReviewZone.css';


const useStyles = makeStyles(theme => ({
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

const defaultModels = {
  model: "nb"
}

const ProjectAlgorithms = (props) => {
  const classes = useStyles();

  // the state contains new attribute to check for old  data
  // or not as well as an edit attribute.
  const [state, setState] = React.useState({
    // is this a new card? If undefined, it is assumed to be new
    new: (props.new === undefined) ? true : props.new,
    // open card in edit mode or not
    edit: (props.edit === undefined) ? true : props.edit,
  })

  const [algorithms, setAlgorithms] = React.useState(
    (props.new === undefined || props.new) ? defaultModels : null
  );

  // help button
  const [help, openHelp, closeHelp] = useHelp();

  // algorithm change
  const handleAlgorithmChange = (event) => {

    // set the algorithms state
    setAlgorithms({
      model: event.target.value
    })

  };

  // send an update to the server on a model change
  useEffect(() => {

    if (algorithms !== null){
        var bodyFormData = new FormData();
        bodyFormData.set('model', algorithms.model);

        axios({
          method: "post",
          url: api_url + "project/" + props.project_id + "/algorithms",
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

  }, [algorithms, props.project_id]);

  // if the state is lock, then fetch the data
  useEffect(() => {

    // fetch algorithms info
    const fetchAlgorithmsSettings = async () => {

      // contruct URL
      const url = api_url + "project/" + props.project_id + "/algorithms";

      axios.get(url)
        .then((result) => {

          if ("model" in result.data){
            // set the project algorithms
            setAlgorithms(result.data);
          } else {
            // set the state to new
            setState({
              new: true,
              edit: state.edit,
            })
            setAlgorithms(defaultModels);
          }

        })
        .catch((error) => {
          console.log(error);
        });
    };

    // scroll into view
    props.scrollToBottom()

    // get the values if locked
    if (!state.new){
        fetchAlgorithmsSettings();
    }

  }, [state.new, state.edit, props.project_id, props.scrollToBottom]);

  return (
    <Box>
      <Grow in={true}>
        <Paper className="Card">
          <Box>
            <CardHeader

              /* Algorithms card */
              title="Select Active Learning model"
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

              {algorithms !== null &&
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <Typography variant="body2" className={classes.listTitle}>
                        Select a classifier (skip for using the default)
                    </Typography>

                    {}
                    <List dense={true}>
                      <ListItem>
                        <Radio
                          checked={algorithms["model"] === 'nb'}
                          value="nb"
                          color="default"
                          inputProps={{ 'aria-label': 'naïve bayes' }}
                          onChange={handleAlgorithmChange}
                        />
                        <ListItemText primary="naïve bayes" />
                      </ListItem>

                      <ListItem>
                        <Radio
                          checked={algorithms["model"] === 'svm'}
                          value="svm"
                          color="default"
                          inputProps={{ 'aria-label': 'support vector machines' }}
                          onChange={handleAlgorithmChange}
                        />
                        <ListItemText primary="support vector machines" />
                      </ListItem>
                      <ListItem>
                        <Radio
                          checked={algorithms["model"] === 'logistic'}
                          value="logistic"
                          color="default"
                          inputProps={{ 'aria-label': 'logistic regression' }}
                          onChange={handleAlgorithmChange}
                        />
                        <ListItemText primary="logistic regression" />
                      </ListItem>

                      <ListItem>
                        <Radio
                          checked={algorithms["model"] === 'rf'}
                          value="rf"
                          color="default"
                          inputProps={{ 'aria-label': 'random forest' }}
                          onChange={handleAlgorithmChange}
                        />
                        <ListItemText primary="random forest" />
                      </ListItem>
                    </List>
                  </Grid>

                </Grid>
              }
              </Box>
        </Paper>
      </Grow>

      <Help
        open={help}
        onClose={closeHelp}
        title="Algorithms"
        message={
          <Box>
            <Typography variant="body2" gutterBottom>
              Several active learning models are available. The default is the Naïve Bayes which overall has the best performance.
            </Typography>
            <Typography variant="body2" gutterBottom>
              Model performance differs across datasets. Doing 
              <Link 
                className={classes.link}
                href="https://asreview.readthedocs.io/en/latest/sim_overview.html#doing-the-simulation"
                target="_blank"
              >simulations
              </Link> can be a great way to assess how well a model performs for your particular needs.
            </Typography>
          </Box>
        }
      />
    </Box>
  )
}

export default ProjectAlgorithms;

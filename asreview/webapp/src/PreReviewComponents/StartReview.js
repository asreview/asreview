import React, {} from 'react'
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Radio
} from '@material-ui/core'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  listTitle: {
    paddingLeft: "18px",
  },
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const StartReview = (props) => {
  const classes = useStyles();

  const [state, setState] = React.useState({
    "modelIsTraining": false
  });

  const [machineLearningModel, setmachineLearningModel] = React.useState('nb');

  const handleMachineLearningModelChange = (event) => {
    setmachineLearningModel(event.target.value);
  };


  const startTraining = () => {

    // set the state to 'model training'
    setState({
      "modelIsTraining": true
    })

    const url = api_url + `project/${props.project_id}/start`;

    var bodyFormData = new FormData();
    bodyFormData.set('machine_learning_model', machineLearningModel);

    return axios({
      method: 'post',
      url: url,
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data' }
    })
    .then((result) => {
      checkModelIsFitted();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const checkModelIsFitted = () => {

    const url = api_url + `project/${props.project_id}/model/init_ready`;

    return axios.get(url)
    .then((result) => {


      if (result.data["status"] === 1){
        // model ready
        props.setAppState('review');
      } else {
        // not ready yet
        setTimeout(checkModelIsFitted, 2000);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }

  return (
    <Box>
      { !state["modelIsTraining"] ?
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container justify="space-between">
              <Grid item>
                <Typography variant="h5">
                  Start the systematic review
                </Typography>
              </Grid>

              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startTraining}
                >
                  Start reviewing
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={0}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" className={classes.listTitle}>
                      Machine learning models
                  </Typography>

                  <List dense={true}>
                    <ListItem>
                      <Radio
                        checked={machineLearningModel === 'nb'}
                        value="nb"
                        color="default"
                        inputProps={{ 'aria-label': 'Naïve Bayes' }}
                        onChange={handleMachineLearningModelChange}
                      />
                      <ListItemText primary="Naïve Bayes" />
                    </ListItem>

                    <ListItem>
                      <Radio
                        checked={machineLearningModel === 'svm'}
                        value="svm"
                        color="default"
                        inputProps={{ 'aria-label': 'Support Vector Machines' }}
                        onChange={handleMachineLearningModelChange}
                      />
                      <ListItemText primary="Support Vector Machines" />
                    </ListItem>
                    <ListItem>
                      <Radio
                        checked={machineLearningModel === 'logistic'}
                        value="logistic"
                        color="default"
                        inputProps={{ 'aria-label': 'Logistic Regression' }}
                        onChange={handleMachineLearningModelChange}
                      />
                      <ListItemText primary="Logistic Regression" />
                    </ListItem>

                    <ListItem>
                      <Radio
                        checked={machineLearningModel === 'rf'}
                        value="rf"
                        color="default"
                        inputProps={{ 'aria-label': 'Random Forest' }}
                        onChange={handleMachineLearningModelChange}
                      />
                      <ListItemText primary="Random Forest" />
                    </ListItem>
                  </List>
                </Grid>

              </Grid>
            </Paper>
          </Grid>
        </Grid>
        :
        <Typography>Training model... (this can take some time)</Typography>
      }
    </Box>
  )
}

export default connect(mapStateToProps)(StartReview);

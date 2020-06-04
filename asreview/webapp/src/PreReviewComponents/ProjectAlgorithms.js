import React, {useEffect} from 'react'
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Radio,
  CardHeader,
  Avatar,
  Tooltip,
  IconButton,
} from '@material-ui/core'

import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';
import AssignmentIcon from '@material-ui/icons/Assignment';

import {
  Help,
  useHelp,
} from '../PreReviewComponents'

import axios from 'axios'

import { api_url, mapStateToProps } from '../globals.js';

import { connect } from "react-redux";

import { makeStyles } from '@material-ui/core/styles';

import './ReviewZone.css';


const useStyles = makeStyles(theme => ({
  listTitle: {
    paddingLeft: "18px",
  },
}));

const ProjectAlgorithms = (props) => {
  const classes = useStyles();

  const [state, setState] = React.useState("edit")

  const [help, openHelp, closeHelp] = useHelp();

  const [machineLearningModel, setmachineLearningModel] = React.useState('nb');

  const handleMachineLearningModelChange = (event) => {
    setmachineLearningModel(event.target.value);
  };

  useEffect(() => {
    props.scrollToBottom()
  }, []);

  return (
    <Box>

      <Paper className="Card">

        <Box>
          <CardHeader
            avatar={
              <Avatar aria-label="recipe" className={classes.avatar}>
                <AssignmentIcon />
              </Avatar>
            }
            action={
              <Box>
              {state === "lock" &&
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
            title="Select algorithms"
          />


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
            </Box>
      </Paper>


      <Help
        open={help}
        onClose={closeHelp}
        title="Algorithms"
        message={
          <Box>
          <Typography>Every active learning model likes a warm start. Prior knowledge is very important. </Typography>
          </Box>
        }
      />
    </Box>
  )
}

export default connect(mapStateToProps)(ProjectAlgorithms);

import React, {useRef, useEffect}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Container,
  Stepper,
  Step,
  Grid,
  StepLabel,
  StepButton,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItemIcon,
  Divider,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import {
  PriorKnowledge,
  ProjectInit,
  ProjectUpload,
  ProjectAlgorithms,
  StartReview,
  HelpDialog,
  PreReviewZone,
} from '../PreReviewComponents'

import DangerZone from '../DangerZone.js'
import PublicationZone from '../PublicationZone.js'
import StatisticsZone from '../StatisticsZone.js'

import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import InboxIcon from '@material-ui/icons/Inbox';
import GetAppIcon from '@material-ui/icons/GetApp';

import FullyRead from '../images/FullyRead.png';

import { connect } from "react-redux";
import store from '../redux/store'

import axios from 'axios'

import { api_url, mapStateToProps } from '../globals.js';

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: "128px",
    paddingBottom: "48px",
    textAlign: "center",
  },
  title: {
    fontWeight: "300",
    letterSpacing: ".7rem",
  },
  continuButton: {
  },
  quickStartButtons: {
    marginTop: "24px",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: 0,
    marginLeft: -12,
  },
  dangerZone : {
    borderColor: "red",
    borderWidth: "2px",
    borderStyle: "solid",
    boxShadow: "none",
},
  cardBox : {
    paddingBottom: "24px",
  },
  stateElas : {
    width: "100%",
    maxWidth: "200px",
    display: "block",
    margin: "auto",
  },
}));

const ProjectPage = (props) => {

  const classes = useStyles();

  const [state, setState] = React.useState({
    // info-header
    infoLoading: true,
    info: null,

    // stage
    setup: false,
    training: false,

  });

  const [settings, setSettings] = React.useState(false);


  const toggleProjectSettings = () => {
    console.log("Open settings project " + props.id)
    setSettings(a => (!a));
  };


  const finishProjectSetup = () => {
    setState({
      ...state,
      setup : false,
      training : true,
    })
  }

  const finishProjectFirstTraining = () => {

    setState({
      info: {...state.info, projectInitReady : true},
      training : false,
    })
  }


  const continueProjectSetup = () => {
    setState({
      ...state,
      setup : true,
    })
  }

  useEffect(() => {

    const fetchProjectInfo = async () => {

      // contruct URL
      const url = api_url + "project/" + props.project_id + "/info";

      axios.get(url)
        .then((result) => {

          setState({
            ...state,
            infoLoading: false,
            info: result.data,
          })

        })
        .catch((error) => {
          console.log(error);
        });
    };

    fetchProjectInfo();


  }, []);

  return (
    <Box>
      {!state.infoLoading &&
        <Box className={classes.box}>
          <Container maxWidth='md'>

            <Grid container spacing={3} className={classes.header}>
              <Grid item xs={12} sm={3}>
                <img
                  src={FullyRead}
                  alt="Logo"
                  className={classes.stateElas}
                />
              </Grid>
              <Grid item xs={12} sm={9}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  color="primary"
                  className={classes.title}
                >
                  {state.info.name}
                </Typography>
                <Typography
                  color="primary"
                  variant="h5"
                >
                  {state.info.description}
                </Typography>
              {/*
              </Grid>
              <Grid item xs={12}>
              */}
                <Box className={classes.quickStartButtons}>

                  {(state.info.projectInitReady && !state.setup && !state.training) &&
                    <Tooltip title="Download results">
                      <IconButton
                        aria-label="Export"
                        onClick={props.toggleExportResult}
                        color="inherit"
                      >
                        <GetAppIcon />
                      </IconButton>
                    </Tooltip>
                  }

                  {/* Project is ready, show button */}
                  {(state.info.projectInitReady && !state.setup && !state.training) &&
                    <Button
                      className={classes.continuButton}
                      variant={"outlined"}
                      onClick={()=>props.handleAppState("review")}
                    >
                      Continue reviewing
                    </Button>
                  }

                  {/* Project is not ready, continue setup */}
                  {(!state.info.projectInitReady && !state.setup && !state.training) &&
                    <Button
                      className={classes.continuButton}
                      variant={"outlined"}
                      onClick={continueProjectSetup}
                    >
                      Start setup
                    </Button>
                  }

                  {(!state.info.projectInitReady && !state.setup && state.training) &&
                    <div className={classes.wrapper}>
                      <Button
                        variant={"outlined"}
                        disabled
                        className={classes.continuButton}
                        startIcon={<KeyboardVoiceIcon />}
                      >
                        Training model
                      </Button>
                      <CircularProgress size={24} className={classes.buttonProgress} />
                    </div>

                  }
                </Box>

                {/* Project is not ready, continue setup */}
                {state.training &&
                  <StartReview
                    onReady={finishProjectFirstTraining}
                  />
                }
              </Grid>
            </Grid>

            {/* Cards on the project board */}
            {!state.setup &&
              <Box className={classes.cardBox}>
                <StatisticsZone
                  project_id={props.project_id}
                />
                <PublicationZone
                  project_id={props.project_id}
                />
                <DangerZone
                  project_id={props.project_id}
                  handleAppState={props.handleAppState}
                />
              </Box>
            }

            {/* Pre Review settings */}
            {state.setup &&
              <PreReviewZone
                finishProjectSetup={finishProjectSetup}
              />
            }
          </Container>
        </Box>
      }
    </Box>
  )
}

export default connect(mapStateToProps)(ProjectPage);

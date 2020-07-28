import React, {useRef, useEffect}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import {
  StartReview,
  PreReviewZone,
} from '../PreReviewComponents'

import DangerZone from '../DangerZone.js'
import PublicationZone from '../PublicationZone.js'
import StatisticsZone from '../StatisticsZone.js'

import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import GetAppIcon from '@material-ui/icons/GetApp';

import InReview from '../images/InReview.svg';
import SetUp from '../images/SetUp.svg';

import { connect } from "react-redux";

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
    marginTop: -12,
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

  const EndRef = useRef(null)

  const [state, setState] = React.useState({
    // info-header
    infoLoading: true,
    info: null,

    // stage
    setupFirstTime: (props.setupFirstTime ? props.setupFirstTime : false),
    setup: false,
    training: false,

  });

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

  const returnElasState = () => {
    // setup
    if (!state.info.projectInitReady || state.setup){
      return SetUp
    }

    // review
    return InReview
  }

  const scrollToTop = () => {
    EndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {

    if (!state.infoLoading && EndRef.current !== undefined){
      scrollToTop()
    }

  }, [state.setup, state.infoLoading]);


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
          <div ref={EndRef} />
          <Container maxWidth='md'>

            <Grid container spacing={3} className={classes.header}>
              <Grid item xs={12} sm={3}>
                <img
                  src={returnElasState()}
                  alt="ElasState"
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

                  {/* Project is not ready, continue setup */}
                  {(!state.info.projectInitReady && !state.setup && !state.training) &&
                    <Button
                      className={classes.continuButton}
                      variant={"outlined"}
                      onClick={continueProjectSetup}
                    >
                      {state.info.projectHasDataset ? "Finish" : "Start"} setup
                    </Button>
                  }

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
                      Start reviewing
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
                  projectInitReady={state.info.projectInitReady}
                  training={state.training}
                />
                <PublicationZone
                  project_id={props.project_id}
                  showExportResult={state.info.projectInitReady && !state.setup && !state.training}
                  toggleExportResult={props.toggleExportResult}
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
                scrollToTop={scrollToTop}
              />
            }
          </Container>
        </Box>
      }
    </Box>
  )
}

export default connect(mapStateToProps)(ProjectPage);

import React, {useRef, useEffect}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from '@material-ui/core';

import {
  PreReviewZone,
  StartSimulation,
} from '../PreReviewComponents'

import DangerZone from '../DangerZone.js'
import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import Finished from '../images/Finished.svg';
import InReview from '../images/InReview.svg';
import SetUp from '../images/SetUp.svg';

import { connect } from "react-redux";
import { mapStateToProps } from '../globals.js';

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: "128px",
    paddingBottom: "48px",
    textAlign: "center",
  },
  mode: {
    marginBottom: 20,
    backgroundColor: theme.palette.warning.light
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

const ProjectPageSimulation = (props) => {

  const classes = useStyles();

  const EndRef = useRef(null)

  const [state, setState] = React.useState({
    info: props.info,

    // stage
    setup: false,
    simulating: false,
    finished: false,
  });

  const finishProjectSetup = () => {
    setState({
      ...state,
      setup : false,
      simulating : true,
    })
  }

  const finishProjectSimulation = () => {
    setState({
      ...state,
      simulating : false,
      finished: true,
    })
  }

  const continueProjectSetup = () => {
    setState({
      ...state,
      setup : true,
    })
  }

  const returnElasState = () => {
    // Setup
    if (!state.info.projectInitReady || state.setup){
      return SetUp
    }

    // Simulating review
    if (state.training){
      return InReview
    }

    // finished
    if (state.finished){
      return Finished
    }
  }

  const scrollToTop = () => {
    EndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (EndRef.current !== undefined){
      scrollToTop()
    }
  }, [state.setup, state.finished]);

  return (
    <Box>
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
              <Chip
                label={state.info.mode}
                className={classes.mode}
              />
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

              <Box className={classes.quickStartButtons}>

                {/* Project is not ready, continue setup */}
                {(!state.info.projectInitReady && !state.setup && !state.simulating && !state.finished) &&
                  <Button
                    className={classes.continuButton}
                    variant={"outlined"}
                    onClick={continueProjectSetup}
                  >
                    {state.info.projectHasDataset ? "Finish" : "Start"} setup
                  </Button>
                }

                {state.simulating &&
                  <div className={classes.wrapper}>
                    <Button
                      variant={"outlined"}
                      disabled
                      className={classes.continuButton}
                      startIcon={<KeyboardVoiceIcon />}
                    >
                      Simulating review
                    </Button>
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  </div>
                }

                {state.finished &&
                  <Typography
                    color="primary"
                    variant="h5"
                  >
                    Simulation finished
                  </Typography>
                }
              </Box>

              {/* Project is not ready, continue setup */}
              {state.simulating &&
                <StartSimulation
                  onReady={finishProjectSimulation}
                />
              }
            </Grid>
          </Grid>

          {/* Cards on the project board */}
          {!state.setup && !state.simulating &&
            <Box className={classes.cardBox}>
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
    </Box>
  )
}

export default connect(mapStateToProps)(ProjectPageSimulation);

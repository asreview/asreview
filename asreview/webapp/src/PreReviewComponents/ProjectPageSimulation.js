import React, {useRef, useEffect}  from 'react'

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
import PublicationZone from '../PublicationZone';
import StatisticsZone from '../StatisticsZone';
import { ProjectAPI } from '../api';

const ProjectPageSimulation = (props) => {

  const classes = props.classes

  const EndRef = useRef(null)

  const runningSimulation = (info) => {
    const simulation = info.simulations.find(s => s.state === 'running');
    if (simulation !== undefined) {
      return simulation.id
    }
    return null
  }

  const hasRunningSimulation = (info) => {
    return runningSimulation(info) !== null
  }

  const [state, setState] = React.useState({
    info: props.info,

    // stage
    initial: !props.info.projectSetupReady,
    setup: false,
    simulating: hasRunningSimulation(props.info),
    finished: props.info.projectSetupReady && !hasRunningSimulation(props.info),
  });

  const continueProjectSetup = () => {
    setState({...state,
      initial: false,
      setup : true,
    })
  }

  const finishProjectSetup = () => {
    ProjectAPI.markSetupReady(props.project_id)
      .then((result) => {
        startSimulation()
      })
  }

  const startSimulation = () => {
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

  const returnElasState = () => {
    // Setup
    if (state.initial || state.setup){
      return SetUp
    }

    // Simulating review
    if (state.simulating){
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
                className={classes.chip}
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

                {state.initial &&
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
                      Simulating
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

              {state.simulating &&
                <StartSimulation
                  project_id={props.project_id}
                  simulation_id={runningSimulation(state.info)}
                  onReady={finishProjectSimulation}
                />
              }
            </Grid>
          </Grid>

          {/* Cards on the project board */}
          {!state.setup && !state.simulating &&
            <Box className={classes.cardBox}>
              <StatisticsZone
                project_id={props.project_id}
                statisticsAvailable={state.finished}
              />
              <PublicationZone
                project_id={props.project_id}
                disableOptionDownLoad={false}
                hideOptionFinish={true}
                showExportResult={!state.setup && !state.training}
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
              isPriorKnowledgeEditable={false}
              includePlugins={false}
            />
          }
        </Container>
      </Box>
    </Box>
  )
}

export default connect(mapStateToProps)(ProjectPageSimulation);

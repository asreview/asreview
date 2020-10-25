import React, {useRef, useEffect}  from 'react'

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
} from '.'

import DangerZone from '../DangerZone.js'
import PublicationZone from '../PublicationZone.js'
import StatisticsZone from '../StatisticsZone.js'
import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import GetAppIcon from '@material-ui/icons/GetApp';
import Finished from '../images/Finished.svg';
import InReview from '../images/InReview.svg';
import SetUp from '../images/SetUp.svg';

import { connect } from "react-redux";
import { mapStateToProps } from '../globals.js';
import { ProjectAPI } from '../api';

const ProjectPageOracle  = (props) => {

  const classes = props.classes

  const EndRef = useRef(null)

  const [state, setState] = React.useState({
    info: props.info,

    // stage
    setup: false,
    training: false,
    finished: false,
  });

  const finishProjectSetup = () => {
    setState({...state,
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
    setState({...state,
      setup : true,
    })
  }

  const startReviewing = () => {
    props.handleAppState("review")
  }

  const finishProject = () => {
    ProjectAPI.finish(props.project_id)
      .then((result) => {
        setState({...state,
            finished : !state.finished,
        })
      })
  }

  const returnElasState = () => {
    // setup
    if (!state.info.projectInitReady || state.setup){
      return SetUp
    }

    // review
    if (!state.finished){
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


  useEffect(() => {

    const updateStateWith = (fetchedData) => {
      setState(s => {
        return({
          ...s,
          info: fetchedData,
          finished: fetchedData.reviewFinished,
        })
      })
    }

    const fetchProjectInfo = async () => {
      ProjectAPI.info(props.project_id)
        .then((fetchedData) => {
          updateStateWith(fetchedData)
        })
    };

    fetchProjectInfo();

  }, [props.project_id, state.finished]);

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
                    onClick={startReviewing}
                    disabled={state.finished}
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
                disableOptionDownLoad={!state.info.projectInitReady || state.training}
                disableOptionFinish={!state.info.projectInitReady || state.training}
                hideOptionFinish={false}
                toggleExportResult={props.toggleExportResult}
                reviewFinished={state.finished}
                finishProject={finishProject}
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
              isPriorKnowledgeEditable={true}
              includeExampleDataSets={true}
            />
          }
        </Container>
      </Box>
    </Box>
  )
}

export default connect(mapStateToProps)(ProjectPageOracle );

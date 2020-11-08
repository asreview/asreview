import React, {useEffect} from 'react'
import {
  Box,
  Typography,
} from '@material-ui/core'

import './ReviewZone.css';

import { connect } from "react-redux";

import { mapStateToProps } from '../globals.js';
import { ProjectAPI } from '../api';

const StartSimulation = ({project_id, simulation_id, onReady}) => {

  const [state, setState] = React.useState({
    // status
    start_simulation: simulation_id === null,
    simulating: simulation_id !== null,
    ready: false,

    // data
    simulation_id: simulation_id,
    error_message: null,
  });


  useEffect(() => {

    const waitForSimulationReady = (simulation_id) => {
      setState({
        start_simulation: false,
        simulating: true,
        ready: false,
        simulation_id: simulation_id,
        error_message: null,
      })
    }

    const startSimulationFailed = (error) => {
      console.log(error);
      setState({
        start_simulation: false,
        simulating: false,
        ready: true,
        simulation_id: null,
        error_message: error,
    })
    }

    const startSimulation = () => {
      ProjectAPI.simulate(project_id)
        .then((result) => {
          waitForSimulationReady(result.simulation_id);
        })
        .catch((error) => {
          startSimulationFailed(error)
        });
    }

    if (state.start_simulation){
      startSimulation()
    }

  }, [state.start_simulation, project_id, onReady]);


  useEffect(() => {

    const waitForSimulationReadyFailed = (error) => {
      setState({
        start_simulating: false,
        simulating: false,
        ready: true,
        simulation_id: null,
        error_message: error,
      })
    }

    const waitForSimulationReady = () => {
      ProjectAPI.isSimulationReady(project_id, state.simulation_id)
        .then((result) => {
          if (result.status === 1){
            // simulation ready
            onReady();
          } else {
            // simulation not ready yet
            setTimeout(() => {
              waitForSimulationReady()
            }, 2000);
          }
      })
      .catch((error) => {
        waitForSimulationReadyFailed(error)
      });
    }

    if (state.simulating){
      waitForSimulationReady();
    }

  }, [state.simulating, state.simulation_id, project_id, onReady]);


  return (
    <Box>

      { state.simulating &&
        <Typography>(This can take some time)</Typography>
      }

      { state.ready && state.error_message !== null &&
        <Box>
          <Typography
            color="error"
          >
            An error occured. Please send an email to asreview@uu.nl or file an issue on GitHub.
          </Typography>
          <Typography
            variant="h4"
            color="error"
          >
            Error message
          </Typography>
          <Typography
            color="error"
          >
            {state.error_message}
          </Typography>
        </Box>
      }
    </Box>
  )
}

export default connect(mapStateToProps)(StartSimulation);

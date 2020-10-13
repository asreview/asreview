import React, {useEffect}  from 'react'

import { connect } from "react-redux";

import { mapStateToProps, projectModes } from '../globals.js';
import ProjectPageSimulation from './ProjectPageSimulation';
import ProjectPageOracle from './ProjectPageOracle ';
import { ProjectAPI } from '../api/index.js';


const ProjectPage = (props) => {

  const [state, setState] = React.useState({
    infoLoading: true,
    info: null,
  });

  useEffect(() => {

    const updateStateWith = (fetchedData) => {
      setState(s => {
        return({
          ...s,
          info : fetchedData,
        })
      });
    }

    const fetchProjectInfo = async () => {
      ProjectAPI.info(props.project_id)
        .then((fetchedData) => {
          updateStateWith(fetchedData)
        })
    };

    fetchProjectInfo();

  }, [props.project_id]);

  const Page = () => {
    if (state.info && state.info.mode === projectModes.ORACLE) {
      return <ProjectPageOracle 
        info={state.info}
      /> 
    }
    if (state.info && state.info.mode === projectModes.SIMULATION) {
      return <ProjectPageSimulation 
        info={state.info}
      /> 
    }
    return null
  }

  return (
    <Page />
  )
}

export default connect(mapStateToProps)(ProjectPage);

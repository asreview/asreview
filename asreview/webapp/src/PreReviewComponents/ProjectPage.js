import React, {useEffect}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { connect } from "react-redux";

import { mapStateToProps, projectModes } from '../globals.js';
import ProjectPageSimulation from './ProjectPageSimulation';
import ProjectPageOracle from './ProjectPageOracle';
import { ProjectAPI } from '../api/index.js';

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: "128px",
    paddingBottom: "48px",
    textAlign: "center",
  },
  chip: {
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

const ProjectPage = (props) => {

  const classes = useStyles();

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
        classes={classes}
        info={state.info}
        toggleExportResult={props.toggleExportResult}
        handleAppState={props.handleAppState}
      /> 
    }
    if (state.info && state.info.mode === projectModes.SIMULATION) {
      return <ProjectPageSimulation 
        classes={classes}
        info={state.info}
        toggleExportResult={props.toggleExportResult}
      /> 
    }
    return null
  }

  return (
    <Page />
  )
}

export default connect(mapStateToProps)(ProjectPage);

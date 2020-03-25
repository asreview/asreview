import React, {useCallback, useMemo} from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {useDropzone} from 'react-dropzone'

import {
  Box, 
  Button,
  Typography,
  Toolbar,
} from '@material-ui/core'

import {
  ProjectDemoData,
} from '../PreReviewComponents';

import { connect } from "react-redux";

import axios from 'axios'
import { api_url } from '../globals.js';


const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '30px 20px 30px 20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};


const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: "20px",
  },
  divider: {
    textAlign: "center",
    margin: "20px 0px 20px 0px"
  },
  clear: {
    right: "clear"
  },
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  datasets:{
    maxWidth: theme.spacing(2) * 4 + 390
  }
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ProjectUpload = (props) => {

  const classes = useStyles();

  const [file, setFile] = React.useState(null);

  const onDrop = useCallback(acceptedFiles => {

    if (acceptedFiles.length !== 1){
      console.log("No valid files provided.")
      return 
    }

    // set the state such that we ca upload the file
    setFile(acceptedFiles[0])

  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles
  } = useDropzone({
    onDrop: onDrop,
    multiple: false,
    accept: '.txt,.csv,.ris'
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject
  ]);

  const onUploadHandler = (demo_data_id) => {

      const url = api_url + `project/${props.project_id}/upload`;

      const data = new FormData() 

      if(demo_data_id === undefined){
        data.append('file', file)
      } else {
        data.append('demo_data', demo_data_id)
      }

      axios({
        method: 'post',
        url: url,
        data: data
      })
      .then(function (res) {
        // go to the next step
        props.handleNext()

      })
      .catch(function (res) {
          //handle error
          console.log(res.statusText)
      });
  }


  return (

  <Box>
    <Typography variant="h5" className={classes.title}>
      Select a dataset
    </Typography>

    <div>
      <div {...getRootProps({style})}>
        <input {...getInputProps()} />
        <Typography>Drag 'n' drop a file here, or click to a file</Typography>
      </div>
      {acceptedFiles.length === 1 &&
        <div>
          <Typography>File '{acceptedFiles[0].path}' selected.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onUploadHandler}
            className={classes.button}
          >
            Next
          </Button>
        </div>
      }
    </div>

    <Typography className={classes.divider}>
      - or select a dataset below -
    </Typography> 
    <ProjectDemoData
      onUploadHandler={onUploadHandler}
    />
    <Toolbar className={classes.clear}/>

  </Box>
  );
}

export default connect(mapStateToProps)(ProjectUpload);

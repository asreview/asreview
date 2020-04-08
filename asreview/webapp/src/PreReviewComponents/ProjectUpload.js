import React, {useCallback, useMemo, useRef} from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {useDropzone} from 'react-dropzone'

import {
  Card,
  CardContent,
  AppBar,
  Box,
  Button,
  Typography,
  Toolbar,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from '@material-ui/core'

import { Alert, AlertTitle } from '@material-ui/lab';

import {
  ProjectUploadDatasets,
} from '../PreReviewComponents';

import { connect } from "react-redux";

import axios from 'axios'
import { api_url } from '../globals.js';


const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '60px 20px 60px 20px',
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
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    marginBottom: "32px",
    minHeight: "200px",
  },
  rootPaper: {
    padding: '20px',
  },
  title: {
    marginBottom: "20px",
  },
  upload: {
  },
  divider: {
    textAlign: "center",
    margin: "20px 0px 20px 0px"
  },
  clear: {
    right: "clear"
  },
  nextButton: {
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

  const EndRef = useRef(null)

  const [file, setFile] = React.useState(null);
  const [upload, setUpload] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [error, setError] = React.useState(null);

  const scrollToBottom = () => {
    EndRef.current.scrollIntoView({ behavior: "smooth" })
  }

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
    accept: '.txt,.csv,.ris,.xlsx'
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

  const onUploadHandler = (demo_data_id, callback) => {

      // disable the buttons and show loader
      setUpload(true)

      // remove selection
      setSelection(null);

      // set error to state
      setError(null)

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

        // reset button
        setUpload(false);

        // remove accepted files
        setFile(null);

        // get statistics
        setSelection(res.data);

        // scroll to bottom
        scrollToBottom();

        // callback
        if (callback !== undefined){
          callback();
        }

      })
      .catch(function (error) {

          // set upload to false
          setUpload(false);

          // remove accepted files
          setFile(null);

          // remove selection
          setSelection(null);

          // set error to state
          setError(error.response.data["message"])

          // scroll to bottom
          scrollToBottom();

          // callback
          if (callback !== undefined){
            callback();
          }
      });
  }


  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const removeDataset = () => {
    // no actual removing at the moment. TODO{Jonathan}
    setSelection(null);
  }

  const nextStep = () => {
    // check if everything is ready to go to the next step

    // go to the next step
    props.handleNext()
  };


  return (
  <Box>
    <Typography variant="h5" className={classes.title}>
      Select a dataset
    </Typography>

    <Paper className={classes.root}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="From file" />
          <Tab label="From url" />
          <Tab label="From plugin" />
          <Tab label="Example datasets" />
        </Tabs>

      <Box className={classes.rootPaper}>
        {value === 0 &&

          <div>
            <div className={classes.upload} {...getRootProps({style})}>
              <input {...getInputProps()} />
              <Typography>Drag 'n' drop a file here, or click to a file</Typography>
            </div>

            {file !== null &&
              <div>
                <Typography>File '{file.path}' selected.</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={upload}
                  onClick={() => {onUploadHandler()}}
                  className={classes.uploadButton}
                >
                  {upload ? "Uploading..." : "Upload"}
                </Button>
              </div>
            }
          </div>
        }

    {value === 1 &&
      <Typography>Coming soon.</Typography>
    }

    {value === 2 &&
      <ProjectUploadDatasets
        subset={"plugin"}
        onUploadHandler={onUploadHandler}
      />
    }

    {value === 3 &&

      <div>
        <Typography>Example datasets are useful for testing algorithms because they are fully labeled into relevant and irrelevant. Relevant articles will display up in red and irrelevant articles in black.</Typography>
        <ProjectUploadDatasets
          subset={"test"}
          onUploadHandler={onUploadHandler}
        />
      </div>
    }
    </Box>

    </Paper>

    {/* The Card with the selected dataset */}
    {selection !== null &&
      <Alert
        severity="success"
        action={
          <Button color="inherit" size="small" onClick={removeDataset}>
            Remove
          </Button>
        }
      >
        <AlertTitle>Success</AlertTitle>
        Successfully uploaded dataset '{selection['filename']}' with {selection['n_rows']} publications.
      </Alert>
    }

    {/* The Card with the selected dataset */}
    {error !== null &&
      <Alert
        severity="error"
        onClose={() => {setError(null)}}
      >
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>

    }

    {/* Go to the next step if upload was successfull */}
    <Button
      variant="contained"
      color="primary"
      disabled={selection === null}
      onClick={nextStep}
      className={classes.nextButton}
    >
      Next
    </Button>
    <div ref={EndRef} />
  </Box>
  );
}

      // <Card>
      //   <CardContent>
      //     <Typography component="h5" variant="h5">
      //       {selection['n_rows']}
      //     </Typography>
      //   </CardContent>
      // </Card>

export default connect(mapStateToProps)(ProjectUpload);

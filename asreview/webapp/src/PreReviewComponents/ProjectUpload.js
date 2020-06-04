import React, {useCallback, useMemo, useRef, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {useDropzone} from 'react-dropzone'

import {
  Box,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  Link,
  CardHeader,
  Avatar,
  Tooltip,
  IconButton,
  CardContent,
} from '@material-ui/core'

import { blue, green } from '@material-ui/core/colors';

import AssignmentIcon from '@material-ui/icons/Assignment';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import HelpIcon from '@material-ui/icons/Help';

import {
  ProjectUploadDatasets,
  ProjectUploadURL,
  Help,
  useHelp,
} from '../PreReviewComponents';

import { connect } from "react-redux";

import axios from 'axios'
import { api_url, mapStateToProps } from '../globals.js';

import './ReviewZone.css';


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
  },
  uploadButton: {
    marginTop: '26px',
  },
  avatar: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
  }
}));


const ProjectUpload = (props) => {

  const classes = useStyles();

  const EndRef = useRef(null)

  const [state, setState] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [upload, setUpload] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [help, openHelp, closeHelp] = useHelp()

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
    // acceptedFiles
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
    isDragReject,
    isDragAccept
  ]);

  const onUploadHandler = (data, callback) => {

      // disable the buttons and show loader
      setUpload(true)

      // remove selection
      setState(null);

      // set error to state
      setError(null)

      const url = api_url + `project/${props.project_id}/data`;

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
        setState(res.data);

        // set next button ready
        props.isReady();

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
          setState(null);

          // set error to state
          setError(error.response.data["message"])

          // callback
          if (callback !== undefined){
            callback();
          }
      });
  }

  /* Upload file */
  const onUploadHandlerFile = (callback) => {

    const data = new FormData()
    data.append('file', file)

    return onUploadHandler(data, callback)
  }

  /* Upload demo dataset */
  const onUploadHandlerDemoDataset = (demo_data_id, callback) => {

    const data = new FormData()
    data.append('demo_data', demo_data_id)

    return onUploadHandler(data, callback)
  }

  /* Upload demo dataset */
  const onUploadHandlerURL = (url, callback) => {

    const data = new FormData()
    data.append('url', url)

    return onUploadHandler(data, callback)
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const removeDataset = () => {
    // no actual removing at the moment. TODO{Jonathan}
    setState(null);
  }

  useEffect(() => {
    props.scrollToBottom()
  }, []);

  return (
  <Box>

    <Paper className={classes.root}>

      <CardHeader
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>
            <AssignmentIcon />
          </Avatar>
        }
        action={
          <Box>
          {state !== null &&
            <Tooltip title="Edit">

              <IconButton
                aria-label="project-info-edit"
                onClick={removeDataset}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          }

          <Tooltip title="Help">

          <IconButton
            onClick={openHelp}
            aria-label="project-dataset-help"
          >
            <HelpIcon />
          </IconButton>
          </Tooltip>
          </Box>
        }
        title="Select a dataset"
      />



        {state === null &&

          <Box>
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

          <CardContent>
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
                      onClick={() => onUploadHandlerFile()}
                      className={classes.uploadButton}
                    >
                      {upload ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                }
              </div>
            }

            {value === 1 &&
              <div>
                <Typography>Upload a dataset from the internet with a link. For example: <Link target="_blank" rel="noreferrer" href="https://raw.githubusercontent.com/asreview/asreview/master/datasets/ACEInhibitors.csv">ACEInhibitors.csv</Link></Typography>
                <ProjectUploadURL
                  upload={upload}
                  onUploadHandler={onUploadHandlerURL}
                />
              </div>
            }

            {value === 2 &&
              <ProjectUploadDatasets
                subset={"plugin"}
                onUploadHandler={onUploadHandlerDemoDataset}
              />
            }

            {value === 3 &&

              <div>
                <Typography>Example datasets are useful for testing algorithms because they are fully labeled into relevant and irrelevant. Relevant articles will display up in red and irrelevant articles in black.</Typography>
                <ProjectUploadDatasets
                  subset={"test"}
                  onUploadHandler={onUploadHandlerDemoDataset}
                />
              </div>
            }
          </CardContent>
      </Box>

    }

    {/* The Card with the selected dataset */}
    {state !== null &&
      <CardContent className="cardHighlight">
        <Typography
          variant="h4"
          noWrap={true}
        >
        {state['filename']}
        </Typography>
        <Box>
          <Typography style={{ color: green[500] }} ><CheckIcon/> Successfull upload</Typography>
        </Box>
        <Typography variant="subtitle1">{state['n_rows']} publications</Typography>
      </CardContent>

    }

    {/* The Card with the selected dataset */}
    {error !== null &&
      <Box>
        <Typography variant="h2">Error</Typography>
        <Typography variant="subtitle1">{error}</Typography>

        <Button color="inherit" size="small" onClick={() => {setError(null)}}>
          Close
        </Button>
      </Box>
    }
    </Paper>


    <Help
      open={help}
      onClose={closeHelp}
      title="Select Dataset"
      message={
        <Box>
        <Typography>Select a dataset from your computer, from a URL, a plugin or a demo dataset.</Typography>
        <Typography>ASReview software accepts CSV files, RIS files, and Excel files.</Typography>
        </Box>
      }
    />

  </Box>
  );
}

export default connect(mapStateToProps)(ProjectUpload);

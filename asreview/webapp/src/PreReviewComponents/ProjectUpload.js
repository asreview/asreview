import React, {useCallback, useMemo, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {useDropzone} from 'react-dropzone'

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Paper,
  Tabs,
  Tab,
  Link,
  CardHeader,
  Tooltip,
  IconButton,
  CardContent,
  Grow,
} from '@material-ui/core'

import { green, brown } from '@material-ui/core/colors';

import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import HelpIcon from '@material-ui/icons/Help';

import {
  ProjectUploadDatasets,
  ProjectUploadURL,
  Help,
  useHelp,
} from '../PreReviewComponents';

import axios from 'axios'
import { api_url } from '../globals.js';

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
    color: theme.palette.getContrastText(brown[500]),
    backgroundColor: brown[500],
  },
  link: {
    paddingLeft: "3px",
  },
}));


const ProjectUpload = ({
  init,
  edit,
  project_id,
  handleNext,
  handleStep,
  setNext,
  scrollToBottom
}) => {

  const classes = useStyles();

  // the state contains new attribute to check for old data
  // or not as well as an edit attribute.
  // IMPORTANT: upload always implies edit mode
  const [state, setState] = React.useState({
    // is this a new card? If undefined, it is assumed to be new
    init: (init === undefined) ? true : init,
    // open card in edit mode or not
    edit: (edit === undefined) ? true : edit,
    // uploading
    upload: false,
  })

  // dataset statistics
  const [statistics, setStatistics] = React.useState(null);

  // set the file
  const [file, setFile] = React.useState(null);

  // raise error (Maybe merge this state with other states)
  const [error, setError] = React.useState(null);

  // open edit warning if there is prior knowledge
  const [openWarning, setOpenWarning] = React.useState(false);

  // help dialog
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

      // // disable the buttons and show loader
      // setUpload(true)

      // remove selection
      setState({
        init: state.init,
        edit: false,
        upload: true,
      });

      // set error to state
      setError(null)

      const url = api_url + `project/${project_id}/data`;

      axios({
        method: 'post',
        url: url,
        data: data
      })
      .then(function (res) {

        // remove accepted files
        setFile(null);

        // set state to lock such that it triggers the fetch stats call
        setState({
          init: false,
          edit: false,
          upload: false,
        });

        // set next button ready
        setNext(true);

        // callback
        if (callback !== undefined){
          callback();
        }

      })
      .catch(function (error) {

          // // set upload to false
          // setUpload(false);

          // remove accepted files
          setFile(null);

          // set state to lock such that it triggers the fetch stats call
          setState({
            init: state.init,
            edit: true,
            upload: false,
          });

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

  const editDataset = () => {

    // open the warnings dialog
    setOpenWarning(true)
  }

  const editDatasetOke = () => {

    // remove all cards after the upload step
    handleStep(1)

    // open the edit mode
    setState({
      init: state.init,
      edit: true,
      upload: false,
    });

    // close the warnings dialog
    setOpenWarning(false);
  };

  const handleCloseWarning = () => {
    setOpenWarning(false);
  };


  useEffect(() => {
    if (scrollToBottom !== undefined){
      scrollToBottom()
    }
  }, [scrollToBottom]);

  useEffect(() => {

    // fetch dataset info
    const fetchDatasetInfo = async () => {

      // contruct URL
      const url = api_url + "project/" + project_id + "/data";

      axios.get(url)
        .then((result) => {

          console.log("Fetch dataset stats")

          // set statistics
          setStatistics(result.data);

        })
        .catch((error) => {
          console.log(error);
        });
    };

    // run if the state is "lock"
    if (!state.edit && !state.upload){
        fetchDatasetInfo();
    } else {
      // set statistics
      setStatistics(null);
    }

  }, [project_id, state.edit, state.upload]);

  return (
  <Box minHeight={"100%"}>

    <Grow
      in={true}
    >
      <Paper className={classes.root}>

        <CardHeader

          /* Dataset card */
          title="Select dataset"
          titleTypographyProps={{"color": "primary"}}

          /* The edit and help options */
          action={
            <Box>
              {!state.edit &&
                <Tooltip title="Edit">
                  <IconButton
                    aria-label="project-info-edit"
                    onClick={editDataset}
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
        />

        <Dialog
          open={openWarning}
          onClose={handleCloseWarning}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure you want to pick a new dataset?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Going back to this step removes all prior knowledge.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseWarning} color="primary">
              Cancel
            </Button>
            <Button onClick={editDatasetOke} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>


          {(state.edit || state.upload) &&

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
                        disabled={state.upload}
                        onClick={() => onUploadHandlerFile()}
                        className={classes.uploadButton}
                      >
                        {state.upload ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  }
                </div>
              }

              {value === 1 &&
                <div>
                  <ProjectUploadURL
                    upload={state.upload}
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
      {(!state.edit && !state.upload && statistics !== null) &&
        <CardContent className="cardHighlight">
          <Typography
            variant="h4"
            noWrap={true}
          >
          {statistics['filename']}
          </Typography>
          <Box>
            <Typography style={{ color: green[500] }} ><CheckIcon/> Successful upload</Typography>
          </Box>
          <Typography variant="subtitle1">{statistics['n_rows']} publications</Typography>
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
    </Grow>


    <Help
      open={help}
      onClose={closeHelp}
      title="Select Dataset"
      message={
        <Box>
          <Typography variant="subtitle2" >
            From file/URL:
            <Typography variant="body2" gutterBottom>
              Select a file from your computer or fill in a link to a file from the Internet.
              The accepted file formats are CSV, Excel, and RIS.
              The selected dataset should contain the title and abstract of each record.
              Read more about
              <Link 
                className={classes.link}
                href="https://asreview.readthedocs.io/en/latest/datasets.html"
                target="_blank"
              >dataset requirements
              </Link>.
            </Typography>
          </Typography>

          <Typography variant="subtitle2" >
            From plugin:
            <Typography variant="body2" gutterBottom>
              Select a dataset from a dataset extension (collection of latest scientific datasets on a specific topic).
              For example:
              <Link
                className={classes.link}
                href="https://asreview.readthedocs.io/en/latest/covid-19.html"
                target="_blank"
              >COVID-19
              </Link>.
            </Typography>
          </Typography>

          <Typography variant="subtitle2" >
            Example datasets:
            <Typography variant="body2" gutterBottom>
              Select an example dataset for testing active learning models.
              The datasets are fully labeled into relevant and irrelevant.
              The relevant records are displayed in red during the review process. Read more about
              <Link
                className={classes.link}
                href="https://asreview.readthedocs.io/en/latest/user_testing_algorithms.html"
                target="_blank"
              >end-user testing
              </Link>.
            </Typography>
          </Typography>
        </Box>
      }
    />

  </Box>
  );
}

export default ProjectUpload;

import React, {useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Typography,
  Toolbar,
  Tooltip,
  TextField,
  Snackbar,
  Paper,
  IconButton,
  CardHeader,
  Avatar,
  CardContent,
} from '@material-ui/core'

import { deepOrange } from '@material-ui/core/colors';

import CloseIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';
import AssignmentIcon from '@material-ui/icons/Assignment';

import {
  Help,
  useHelp,
} from '../PreReviewComponents'

import axios from 'axios'

import store from '../redux/store'
import { setProject } from '../redux/actions'

import { connect } from "react-redux";
import { api_url, mapStateToProps } from '../globals.js';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    marginBottom: "20px",
  },
  button: {
    margin: '36px 0px 0px 12px',
    float: 'right',
  },
  input: {
    display: 'none',
  },
  textfieldItem: {
    marginTop: 0,
    marginBottom: 40,
  },
  clear: {
    overflow: "auto",
  },
  editButton: {
    float: "right",
  },
  avatar: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  }
}));

const ProjectInit = (props) => {

  const classes = useStyles();

  // the state of the app (new, edit or lock)
  const [state, setState] = React.useState(props.project_id !== null ? "lock" : "new")

  const [help, openHelp, closeHelp] = useHelp()

  // the state of the form data
  const [info, setInfo] = React.useState({
    authors: "",
    name: "",
    description: "",
  })
  const [error, setError] = React.useState(false)

  const onChange = (evt) => {
    setInfo({
      ...info,
      [evt.target.name]: evt.target.value
    });
  }

  const submitForm = (evt) => {
    evt.preventDefault();

    let url;
    if (state === "edit"){
      url = api_url + "project/" + props.project_id + "/info/update";
    }  else {
      url = api_url + "project/new";
    }

    var bodyFormData = new FormData();
    bodyFormData.set('project_name', info.name);
    bodyFormData.set('project_authors', info.authors);
    bodyFormData.set('project_description', info.description);

    axios({
      method: 'post',
      url: url,
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data' }
    })
    .then(function (response) {

      console.log(response.data)

      // set the project_id in the redux store
      store.dispatch(setProject(response.data["project_id"]));

      // set the card state to lock
      setState("submit");

      // go to the next step
      props.handleNext();

    })
    .catch(function (response) {
        //handle error
        setError(true);
    });
  }

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setError(false);
  };

  const editInfo = () => {
    setState("edit")
  }

  useEffect(() => {

    const fetchProjectInfo = async () => {

      // contruct URL
      const url = api_url + "project/" + props.project_id + "/info";

      axios.get(url)
        .then((result) => {

          // set the project info
          setInfo({
            authors: result.data["project_name"],
            name: result.data["project_authors"],
            description: result.data["project_description"],
          });

          // set the project_id in the redux store
          store.dispatch(setProject(result.data["project_id"]));

        })
        .catch((error) => {
          console.log(error);
        });
    };

    // run if the state is "lock"
    if (state === "lock"){
        fetchProjectInfo();
    }

  }, [state]);

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
          {state === "lock" &&
            <Tooltip title="Edit">

              <IconButton
                aria-label="project-info-edit"
                onClick={editInfo}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          }

          <Tooltip title="Help">

          <IconButton
            onClick={openHelp}
            aria-label="project-info-help"
          >
            <HelpIcon />
          </IconButton>
          </Tooltip>
          </Box>
        }
        title="Create a project"
      />


      <CardContent>
      {/* The actual form */}
        <form noValidate autoComplete="off">
          <div className={classes.textfieldItem}>
            <TextField
              fullWidth
              autoFocus={true}
              disabled={state === "lock" || state === "submit"}
              required
              name="name"
              id="project-name"
              label="Project name"
              onChange={onChange}
              value={info.name}
            />
          </div>
          <div className={classes.textfieldItem}>
            <TextField
              fullWidth
              disabled={state === "lock" || state === "submit"}
              name="authors"
              id="project-author"
              label="Author(s)"
              onChange={onChange}
              value={info.authors}
            />
          </div>

          <div className={classes.textfieldItem}>
            <TextField
              fullWidth
              disabled={state === "lock" || state === "submit"}
              name="description"
              id="project-description"
              label="Short description"
              onChange={onChange}
              value={info.description}
            />
          </div>
        </form>

        </CardContent>

      </Paper>

       <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={error}
          autoHideDuration={6000}
          onClose={handleErrorClose}
          message="Error: Project name incorrect"
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={handleErrorClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      <div className={classes.nextButton}>
        <Button
          variant="contained"
          color="primary"
          disabled={info.name.length < 3}
          className={classes.button}
          onClick={submitForm}
        >
          Next
        </Button>
      </div>

    <Help
      open={help}
      onClose={closeHelp}
      title="Project settings"
      message={
        <Box>
        <Typography>Provide the project name and the authors. This information is used to create a project. All information is stored locally, no information is send to external servers.</Typography>
        <Typography>The project is stored in the folder ~/.asreview/ followed by the project name.</Typography>
        </Box>
      }
    />

    </Box>
  )
}

export default connect(mapStateToProps)(ProjectInit);

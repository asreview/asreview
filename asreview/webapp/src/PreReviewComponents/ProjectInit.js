import React, {useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Typography,
  Toolbar,
  TextField,
  Snackbar,
  Paper,
  IconButton,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';

import axios from 'axios'

import store from '../redux/store'
import { setProject } from '../redux/actions'

import { connect } from "react-redux";
import { api_url, mapStateToProps } from '../globals.js';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    padding: "24px",
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
  }
}));


const ProjectInit = (props) => {

  const classes = useStyles();

  // the state of the app (new, edit or lock)
  const [state, setState] = React.useState(props.project_id !== null ? "lock" : "new")

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

      <Typography variant="h5" className={classes.title}>
        Create a project
      </Typography>

    <Paper className={classes.root}>
      {/* The actual form */}
        <form noValidate autoComplete="off">
          <div className={classes.textfieldItem}>
            <TextField
              fullWidth
              autoFocus={true}
              disabled={state === "lock" || state === "submit"}
              required
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
              name="description"
              id="project-description"
              label="Short description"
              onChange={onChange}
              value={info.description}
            />
          </div>
        </form>

      {state === "lock" &&
        <Box className={classes.clear}>
          <IconButton
            className={classes.editButton}
            aria-label="edit"
            onClick={editInfo}
          >
            <EditIcon />
          </IconButton>
        </Box>
      }
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
          disabled={info.name.length < 3 || info.authors === ""}
          className={classes.button}
          onClick={submitForm}
        >
          Next
        </Button>
      </div>
    </Box>
  )
}

export default connect(mapStateToProps)(ProjectInit);

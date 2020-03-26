import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box, 
  Button,
  Typography,
  Toolbar,
  TextField,
  Snackbar,
  IconButton,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';

import axios from 'axios'

import store from '../redux/store'
import { setProject } from '../redux/actions'

import { api_url } from '../globals.js';

const useStyles = makeStyles(theme => ({
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
    clear: "right",
  }
}));


const ProjectInit = (props) => {

  const classes = useStyles();

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

    const url = api_url + "project/new";

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

      // set the project_id in the redux store
      store.dispatch(setProject(response.data["project_id"]))

      // go to the next step
      props.handleNext()

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

  return (
    <Box>

      <Typography variant="h5" className={classes.title}>
        Create a project
      </Typography>

    {/* The actual form */}
      <form className={classes.root} noValidate autoComplete="off" onSubmit={submitForm}>
        <div className={classes.textfieldItem}>
          <TextField
            fullWidth
            required
            name="authors"
            id="project-author"
            label="Author(s)"
            onChange={onChange}
          />
        </div>
        <div className={classes.textfieldItem}> 
          <TextField
            fullWidth
            required
            name="name"
            id="project-name"
            label="Projectname"
            onChange={onChange}
          />
        </div>
        <div className={classes.textfieldItem}> 
          <TextField
            fullWidth
            required
            name="description"
            id="project-description"
            label="Short description"
            onChange={onChange}
          />
        </div>
        <div className={classes.nextButton}>
          <Button
            variant="contained"
            color="primary"
            disabled={info.name.length < 3 || info.authors === "" || info.description === ""}
            type="submit"
            className={classes.button}
          >
            Next
          </Button>
        </div>
      </form>
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
      <Toolbar className={classes.clear}/>
    </Box>
  )
}

export default ProjectInit;
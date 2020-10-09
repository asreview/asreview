import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
} from '@material-ui/core'

import { brown } from '@material-ui/core/colors';

import axios from 'axios'

import { setProject } from '../redux/actions'

import { connect } from "react-redux";
import { api_url, mapStateToProps, projectModes } from '../globals.js';

import './ReviewZone.css';


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
  list: {
    backgroundColor: theme.palette.warning.light
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
    color: theme.palette.getContrastText(brown[500]),
    backgroundColor: brown[500],
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));


function mapDispatchToProps(dispatch) {
    return({
        setProjectId: (project_id) => {dispatch(setProject(project_id))}
    })
}

const ProjectInit = (props) => {

  const classes = useStyles();

  // const [open, setOpen] = React.useState(props.open)

  // the state of the form data
  const [info, setInfo] = React.useState({
    authors: "",
    name: "",
    description: "",
    mode: projectModes.ORACLE,
  })
  const [error, setError] = React.useState(false)

  const toggleMode = () => {
    setInfo({
      ...info,
      mode: info.mode === projectModes.ORACLE ? projectModes.SIMULATION : projectModes.ORACLE
    });
  };

  const onChange = (evt) => { 
    setInfo({
      ...info,
      [evt.target.name]: evt.target.value
    });
  }

  const submitForm = (evt) => {
    evt.preventDefault();

    var bodyFormData = new FormData();
    bodyFormData.set('name', info.name);
    bodyFormData.set('authors', info.authors);
    bodyFormData.set('description', info.description);
    bodyFormData.set('mode', info.mode);

    axios({
      method: "post",
      url: api_url + "project/info",
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data' }
    })
    .then(function (response) {

      // set the project_id in the redux store
      props.setProjectId(response.data["id"])

      props.handleAppState("project-page")

    })
    .catch(function (response) {

        //handle error
        setError(true);
    });
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
    >
      <DialogTitle>
        Create a new project
      </DialogTitle>
      <DialogContent dividers={true}>
    {/* The actual form */}
      <form noValidate autoComplete="off">

        <div className={classes.textfieldItem}>
          <TextField
            fullWidth
            error={error}
            autoFocus={true}
            required
            name="name"
            id="project-name"
            label="Project name"
            onChange={onChange}
            value={info.name}
            helperText={error && "Project name already exists"}
          />
        </div>

        <div className={classes.textfieldItem}>
          <TextField
            fullWidth
            name="authors"
            id="project-author"
            label="Your name"
            onChange={onChange}
            value={info.authors}
          />
        </div>

        <div className={classes.textfieldItem}>
          <TextField
            fullWidth
            multiline
            rows={4}
            rowsMax={6}
            name="description"
            id="project-description"
            label="Description"
            onChange={onChange}
            value={info.description}
          />
        </div>

        <List className={classes.list}>
            <ListItem>
              <ListItemText id="switch-list-label-simulation" primary="Simulation" secondary="Some explanation about simulation mode.."/>
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={toggleMode}
                />
              </ListItemSecondaryAction>
            </ListItem>
         </List>   

      </form>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.onClose}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={submitForm}
          color="primary"
          disabled={info.name.length < 3}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectInit);

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
  Grow,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from '@material-ui/core'

import { brown } from '@material-ui/core/colors';

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
  }
}));


function mapDispatchToProps(dispatch) {
    return({
        setProjectId: (project_id) => {dispatch(setProject(project_id))}
    })
}

const ProjectInit = (props) => {

  const classes = useStyles();

  // const [open, setOpen] = React.useState(props.open)

  // the state contains new attribute to check for old data
  // or not as well as an edit attribute.
  const [state, setState] = React.useState({
    // is this a new card? If undefined, it is assumed to be new
    new: (props.new === undefined) ? true : props.new,
    // open card in edit mode or not
    edit: (props.edit === undefined) ? true : props.edit,
  })

  // the state of the form data
  const [info, setInfo] = React.useState({
    authors: "",
    name: "",
    description: "",
  })
  const [error, setError] = React.useState(false)

  // help dialog
  const [help, openHelp, closeHelp] = useHelp()

  const onChange = (evt) => {
    setInfo({
      ...info,
      [evt.target.name]: evt.target.value
    });
  }

  const submitForm = (evt) => {
    evt.preventDefault();

    // props.onClose()

    // let http_method;
    // let url;
    // if (!state.new){
    //   url = api_url + "project/" + props.project_id + "/info"
    //   http_method = "put"
    // }  else {
    //   url = api_url + "project/info"
    //   http_method = "post"
    // }

    var bodyFormData = new FormData();
    bodyFormData.set('name', info.name);
    bodyFormData.set('authors', info.authors);
    bodyFormData.set('description', info.description);

    axios({
      method: "post",
      url: api_url + "project/info",
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data' }
    })
    .then(function (response) {

      console.log("Submit project: " + response.data["id"])

      // set the project_id in the redux store
      props.setProjectId(response.data["id"])

      // // set the card state to lock
      // setState({
      //   new: false,
      //   edit: false,
      // });

      // go to the next step
      // props.handleNext(0)

      props.handleAppState("project-page")

    })
    .catch(function (response) {

        console.log("Project init failed")
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
    setState({
      new: state.new,
      edit: true,
    })
  }

  // useEffect(() => {

  //   const fetchProjectInfo = async () => {

  //     // contruct URL
  //     const url = api_url + "project/" + props.project_id + "/info";

  //     axios.get(url)
  //       .then((result) => {

  //         // set the project info
  //         setInfo({
  //           authors: result.data["authors"],
  //           name: result.data["name"],
  //           description: result.data["description"],
  //         });

  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   };

  //   // run if the state is "lock"
  //   if (!state.new){
  //       fetchProjectInfo();
  //   }

  // }, [state.new]);

  // console.log(state)
  // console.log(store.getState()["project_id"])

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
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
            rowsMax={4}
            name="description"
            id="project-description"
            label="Short description"
            onChange={onChange}
            value={info.description}
          />
        </div>
      </form>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={submitForm}
          color="primary"
          disabled={info.name.length < 3}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectInit);

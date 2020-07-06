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

const ProjectInit = (props) => {

  const classes = useStyles();

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

    let http_method;
    let url;
    if (!state.new){
      url = api_url + "project/" + props.project_id + "/info"
      http_method = "put"
    }  else {
      url = api_url + "project/info"
      http_method = "post"
    }

    var bodyFormData = new FormData();
    bodyFormData.set('name', info.name);
    bodyFormData.set('authors', info.authors);
    bodyFormData.set('description', info.description);

    axios({
      method: http_method,
      url: url,
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data' }
    })
    .then(function (response) {

      console.log("Submit project: " + response.data["id"])

      // set the project_id in the redux store
      props.setProjectId(response.data["id"])

      // set the card state to lock
      setState({
        new: false,
        edit: false,
      });

      // go to the next step
      props.handleNext(0)

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
    setState({
      new: state.new,
      edit: true,
    })
  }

  useEffect(() => {

    const fetchProjectInfo = async () => {

      // contruct URL
      const url = api_url + "project/" + props.project_id + "/info";

      axios.get(url)
        .then((result) => {

          // set the project info
          setInfo({
            authors: result.data["authors"],
            name: result.data["name"],
            description: result.data["description"],
          });

        })
        .catch((error) => {
          console.log(error);
        });
    };

    // run if the state is "lock"
    if (!state.new){
        fetchProjectInfo();
    }

  }, [state.new]);

  console.log(state)
  console.log(store.getState()["project_id"])

  return (
    <Box>

      <Grow in={true}>
      <Paper className="Card">

        <CardHeader
          avatar={
            <Avatar aria-label="recipe" className={classes.avatar}>
              1
            </Avatar>
          }
          action={
            <Box>
            {!state.edit &&
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

        {(state.edit) &&
          <CardContent>
          {/* The actual form */}
            <form noValidate autoComplete="off">
              <div className={classes.textfieldItem}>
                <TextField
                  fullWidth
                  autoFocus={true}
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
                  name="description"
                  id="project-description"
                  label="Short description"
                  onChange={onChange}
                  value={info.description}
                />
              </div>
            </form>
            {state.edit &&
              <Button
                disabled={info.name.length < 3}
                onClick={submitForm}
              >
                Save
              </Button>
            }
            </CardContent>
          }

          {!state.edit &&
            <CardContent className="cardHighlight">
              <Typography
                variant="h4"
                noWrap={true}
              >
              {info.name}
              </Typography>
              <Typography variant="subtitle1">{info.authors}</Typography>
              <Typography variant="subtitle1">{info.description}</Typography>
            </CardContent>

          }


        </Paper>
      </Grow>

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

function mapDispatchToProps(dispatch) {
    return({
        setProjectId: (project_id) => {dispatch(setProject(project_id))}
    })
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectInit);

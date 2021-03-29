import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from '@material-ui/core'

import { brown } from '@material-ui/core/colors';

import ErrorHandler from '../ErrorHandler';
import { ProjectAPI } from '../api/index.js';

import { setProject } from '../redux/actions'

import { connect } from "react-redux";
import { mapStateToProps } from '../globals.js';

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
  })
  const [error, setError] = React.useState({
    "code": null,
    "message": null,
  })

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

    ProjectAPI.init(bodyFormData)
      .then((result) => {

        // set the project_id in the redux store
        props.setProjectId(result.data["id"])

        props.handleAppState("project-page")

      })
      .catch((error) => {

        setError({
          "code": error.code,
          "message": error.message,
        });

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

      {error.code === 503 &&
        <DialogContent dividers={true}>
          <ErrorHandler
            error={error}
          />
        </DialogContent>
      }
      {error.code === 503 &&
        <DialogActions>
          <Button
            onClick={props.onClose}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      }

      {error.code !== 503 &&
        <DialogContent dividers={true}>
        {/* The actual form */}
        <form noValidate autoComplete="off">

          <div className={classes.textfieldItem}>
            <TextField
              fullWidth
              error={error.message !== null}
              autoFocus={true}
              required
              name="name"
              id="project-name"
              label="Project name"
              onChange={onChange}
              value={info.name}
              helperText={error.code !== 503 && error.message}
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

        </form>
        </DialogContent>
      }
      {error.code !== 503 &&
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
      }
    </Dialog>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectInit);

import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from "@material-ui/core";

import { brown } from "@material-ui/core/colors";

import ErrorHandler from "../ErrorHandler";
import { UsersAPI } from "../api/index.js";

import { setUser, setAccessToken } from "../redux/actions";

import { connect } from "react-redux";
import { mapStateToProps } from "../globals.js";

import "../PreReviewComponents/ReviewZone.css";

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: "20px",
  },
  button: {
    margin: "36px 0px 0px 12px",
    float: "right",
  },
  input: {
    display: "none",
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
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

function mapDispatchToProps(dispatch) {
  return {
    setUserId: (user_id) => {
      dispatch(setUser(user_id));
    },
  };
}

const LoginForm2 = (props) => {
  const classes = useStyles();

  // const [open, setOpen] = React.useState(props.open)

  // the state of the form data
  const [info, setInfo] = React.useState({
    email: "",
    password: "",
  });
  const [error, setError] = React.useState({
    code: null,
    message: null,
  });

  const onChange = (evt) => {
    setInfo({
      ...info,
      [evt.target.name]: evt.target.value,
    });
  };

  const submitForm = (evt) => {
    evt.preventDefault();

    var bodyFormData = new FormData();
    bodyFormData.set("email", info.name);
    bodyFormData.set("password", info.authors);

    UsersAPI.handleLoginFormSubmit(bodyFormData)
      .then((result) => {
        props.setAccessToken(result.accessToken);
        props.setUserId(result.data["test"]);
      })
      .catch((error) => {
        setError({
          code: error.code,
          message: error.message,
        });
      });
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth={true}>
      <DialogTitle>Login</DialogTitle>

      {error.code === 503 && (
        <DialogContent dividers={true}>
          <ErrorHandler error={error} />
        </DialogContent>
      )}
      {error.code === 503 && (
        <DialogActions>
          <Button onClick={props.onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      )}

      {error.code !== 503 && (
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
      )}
      {error.code !== 503 && (
        <DialogActions>
          <Button onClick={props.onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={submitForm}
            color="primary"
          >
            Login
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm2);

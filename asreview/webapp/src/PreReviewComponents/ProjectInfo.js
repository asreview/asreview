import React from "react";
import Confetti from "react-confetti";
import { connect } from "react-redux";
// import useWindowSize from 'react-use/lib/useWindowSize'
import {
  Box,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Typography,
} from "@material-ui/core";
import { brown } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

import { ProjectModeSelect } from "../PreReviewComponents";

import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";
import {
  mapStateToProps,
  mapDispatchToProps,
  projectModes,
} from "../globals.js";

import "./ReviewZone.css";

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
  list: {
    backgroundColor: theme.palette.warning.light,
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

const ProjectInit = (props) => {
  const classes = useStyles();

  // const { width, height } = useWindowSize()

  // the state of the form data
  const [info, setInfo] = React.useState({
    authors: "",
    name: "",
    description: "",
    mode: projectModes.ORACLE,
  });
  const [showSimulate, setShowSimulate] = React.useState(false);
  const [error, setError] = React.useState({
    code: null,
    message: null,
  });

  // handle project type/mode change
  const onModeChange = (event) => {
    setInfo({
      ...info,
      mode: event.target.value,
    });
  };

  const onChange = (evt) => {
    if (error.code) {
      setError({
        code: null,
        message: null,
      });
    }

    setInfo({
      ...info,
      [evt.target.name]: evt.target.value,
    });
  };

  const submitForm = (evt) => {
    evt.preventDefault();

    var bodyFormData = new FormData();
    bodyFormData.set("mode", info.mode);
    bodyFormData.set("name", info.name);
    bodyFormData.set("authors", info.authors);
    bodyFormData.set("description", info.description);

    // dialog is open in edit mode
    if (props.edit) {
      ProjectAPI.info(props.project_id, true, bodyFormData)
        .then((result) => {
          props.setProjectId(result.data["id"]);
          props.onClose();
          props.reloadProjectInfo();
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    } else {
      // dialog is open in init mode
      ProjectAPI.init(bodyFormData)
        .then((result) => {
          props.setProjectId(result.data["id"]);
          props.handleAppState("project-page");
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    }
  };

  React.useEffect(() => {
    // unlock simulation mode
    if (info.name === "elas" && !showSimulate) {
      setInfo({
        ...info,
        name: "",
        mode: projectModes.SIMULATION,
      });
      setShowSimulate(true);
    }
  }, [info.name, info, showSimulate]);

  React.useEffect(() => {
    // pre-fill project info in edit mode
    if (props.edit) {
      setInfo(props.info);
    }
  }, [props.edit, props.info]);

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth={true}>
      <DialogTitle>
        {props.edit ? "Edit project info" : "Create a new project"}
      </DialogTitle>
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
              <ProjectModeSelect
                mode={info.mode}
                edit={props.edit}
                onModeChange={onModeChange}
                showSimulate={showSimulate}
              />
            </div>

            {showSimulate && (
              <Box>
                <Typography color="error" className={classes.textfieldItem}>
                  You unlocked the experimental simulation mode!
                </Typography>
                <Confetti
                  recycle={false}
                  tweenDuration={50000}
                  numberOfPieces={1000}
                />
              </Box>
            )}

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
            disabled={info.name.length < 3}
          >
            {props.edit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectInit);

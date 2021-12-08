import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import { ProjectAPI } from "../api/index.js";

import { donateURL } from "../globals.js";

import { connect } from "react-redux";
import store from "../redux/store";

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: "16px",
  },
  file_type: {
    margin: theme.spacing(1),
    width: "100%",
    padding: "12px 0px",
  },
}));

const mapStateToProps = (state) => {
  return { project_id: state.project_id };
};

const ExportDialog = (props) => {
  const classes = useStyles();

  const [exportFileType, setExportFileType] = React.useState("xlsx");
  const [error, setError] = React.useState({
    code: null,
    message: null,
  });

  const handleClearError = () => {
    if (error.message) {
      setError({
        code: null,
        message: null,
      });
    }
  };

  const handleExportFileTypeChange = (event) => {
    handleClearError();
    setExportFileType(event.target.value);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.exportResult) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.exportResult]);

  const downloadResult = () => {
    const project_id = store.getState()["project_id"];

    if (project_id !== null) {
      ProjectAPI.export_results(project_id, exportFileType)
        .then((response) => {
          // file exported
        })
        .catch((error) => {
          setError({
            code: error["code"],
            message: error["message"],
          });
        });
    } else {
      // raise exception
    }
  };

  return (
    <Dialog
      open={props.exportResult}
      onClose={props.toggleExportResult}
      scroll="body"
      fullWidth={true}
      maxWidth={"sm"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      TransitionProps={{
        onExited: () => handleClearError(),
      }}
    >
      <DialogTitle id="scroll-dialog-title">Download review result</DialogTitle>
      <DialogContent dividers={true}>
        <Typography>
          Download the result of your review. Select a file format.
        </Typography>

        <Box className={classes.file_type}>
          <InputLabel id="select-export-file-type-label">File type</InputLabel>
          <Select
            labelId="select-export-file-type-label"
            id="select-export-file-type"
            value={exportFileType}
            onChange={handleExportFileTypeChange}
          >
            <MenuItem value={"xlsx"}>Excel</MenuItem>
            <MenuItem value={"csv"}>CSV (UTF-8)</MenuItem>
            <MenuItem value={"tsv"}>TSV (UTF-8)</MenuItem>
            <MenuItem value={"ris"}>RIS</MenuItem>
          </Select>
        </Box>
        {exportFileType === "ris" && (
          <Alert severity="info">
            Experimental. RIS export is a new option and might be further
            improved. You can send feedback to{" "}
            <Link href={"mailto:asreview@uu.nl"} target="_blank">
              asreview@uu.nl
            </Link>{" "}
            or post it on{" "}
            <Link
              href={"https://github.com/asreview/asreview/discussions"}
              target="_blank"
            >
              GitHub Discussions
            </Link>
            .
          </Alert>
        )}
        {error.message && <Alert severity="error">{error["message"]}</Alert>}
      </DialogContent>

      <DialogContent dividers={true}>
        {donateURL !== undefined && (
          <Typography>
            Our software is made with love and freely available for everyone.
            Help the development of the ASReview with a donation:{" "}
            <Link href={donateURL} target="_blank">
              asreview.nl/donate
            </Link>
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.toggleExportResult}>Cancel</Button>
        <Button onClick={downloadResult}>Download</Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapStateToProps)(ExportDialog);

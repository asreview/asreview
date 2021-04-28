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

import { ProjectAPI } from "../api/index.js";

import { donateURL } from "../globals.js";

import { connect } from "react-redux";
import store from "../redux/store";

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: "16px",
  },
  link: {
    paddingLeft: "3px",
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

  const [exportFileType, setExportFileType] = React.useState("excel");

  const handleExportFileTypeChange = (event) => {
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
      ProjectAPI.export_results(project_id, exportFileType);
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
    >
      <DialogTitle id="scroll-dialog-title">Download review result</DialogTitle>
      <DialogContent dividers={true}>
        <Typography>
          Download the result of your review. Select a file format (Excel or CSV
          file).
        </Typography>

        <Box className={classes.file_type}>
          <InputLabel id="select-export-file-type-label">File type</InputLabel>
          <Select
            labelId="select-export-file-type-label"
            id="select-export-file-type"
            value={exportFileType}
            onChange={handleExportFileTypeChange}
          >
            <MenuItem value={"excel"}>Excel</MenuItem>
            <MenuItem value={"csv"}>CSV (UTF-8)</MenuItem>
            <MenuItem value={"tsv"}>TSV (UTF-8)</MenuItem>
          </Select>
        </Box>
      </DialogContent>

      <DialogContent dividers={true}>
        {donateURL !== undefined && (
          <Typography>
            Our software is made with love and freely available for everyone.
            Help the development of the ASReview with a donation:
            <Link className={classes.link} href={donateURL} target="_blank">
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

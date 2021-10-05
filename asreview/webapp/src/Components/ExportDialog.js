import React from "react";
import { connect } from "react-redux";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ProjectAPI } from "../api/index.js";
import { donateURL } from "../globals.js";
import store from "../redux/store";

const PREFIX = "ExportDialog";

const classes = {
  button: `${PREFIX}-button`,
  link: `${PREFIX}-link`,
  file_type: `${PREFIX}-file_type`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.button}`]: {
    marginTop: "16px",
  },

  [`& .${classes.link}`]: {
    paddingLeft: "3px",
  },

  [`& .${classes.file_type}`]: {
    margin: theme.spacing(1),
    width: "100%",
    padding: "12px 0px",
  },
}));

const mapStateToProps = (state) => {
  return { project_id: state.project_id };
};

const ExportDialog = (props) => {
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
    <StyledDialog
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
    </StyledDialog>
  );
};

export default connect(mapStateToProps)(ExportDialog);

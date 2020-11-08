import React  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@material-ui/core';

import { api_url } from './globals.js';

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: "128px",
    paddingBottom: "84px",
    textAlign: "center",
  },
  title: {
    color: "orange",
    margin: "32px 12px 12px 12px",
  },
  continuButton: {
    marginTop: "24px",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: 0,
    marginLeft: -12,
  },
  mediumDangerZone : {
    // borderColor: "orange",
    // borderWidth: "2px",
    // borderStyle: "solid",
    // boxShadow: "none",
}
}));

const PublicationZone = (props) => {

  const classes = useStyles();

  /*
  Download the project file
  */
  const downloadProject = () => {

    // download URL, example http://localhost:5000/api/project/myproject/export_project
    const exportUrl = api_url + `project/${props.project_id}/export_project`

    setTimeout(() => {
      const response = {
        file: exportUrl,
      };
      window.location.href = response.file;
    }, 100);

  }

  return (
    <Box>
      <Typography
        variant="h6"
        className={classes.title}
      >
        Publication and export
      </Typography>

      <Paper className={classes.mediumDangerZone}>
        <List className={classes.root}>
          <ListItem
            button
            onClick={props.toggleExportResult}
            alignItems="flex-start"
            disabled={props.disableOptionDownload}
            key="download-result"
          >
            <ListItemText
              primary="Download results"
              secondary={'Download a file with all decisions. Various download formats are available.'}
            />
          </ListItem>
          <Divider component="li" />
          <ListItem
            button
            onClick={downloadProject}
            alignItems="flex-start"
            key="download-project"
          >
            <ListItemText
              primary="Export this project"
              secondary={'Download a complete copy of this project. Ideal to share or import later on.'}
            />
          </ListItem>

          {!props.hideOptionFinish &&
            <div>
            <Divider component="li" />
            <ListItem
              button
              onClick={props.finishProject}
              alignItems="flex-start"
              disabled={props.disableOptionFinish}
              key="finish-project"
            >
              <ListItemText
                primary={props.reviewFinished ? "Mark screening as finished (undo)" : "Mark screening as finished"}
                secondary={props.reviewFinished ? 'Mark the screening process as ongoing and resume reviewing.' : 'Stop reviewing and mark the screening process as finished.'}
              />
            </ListItem>
            </div>
          } 
        </List>
      </Paper>
    </Box>
  )
}

export default PublicationZone;

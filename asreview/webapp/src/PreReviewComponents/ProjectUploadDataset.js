import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  Button,
  Divider,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginBottom: '5px',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

const Dataset = (props) => {

  const classes = useStyles();

  const handleChange = (index, featured) => (event, isExpanded) => {

    if (!props.uploading) {
      if (featured) {
        props.setExpanded(s => {return({
          "all": false,
          "featured": isExpanded ? index : false,
        })});
      } else {
        props.setExpanded(s => {return({
          "all": isExpanded ? index : false,
          "featured": false,
        })});
      };
    };

  };

  const uploadDataset = () => {

    // upload state
    props.setUploading(true);

    // send upload request to server
    props.onUploadHandler(props.dataset_id, resetState);

  }

  const resetState = () => {
    // props.setUploading(false);
  };

  return (
    <div className={classes.root}>
      <Accordion
        expanded={props.expanded === props.index}
        onChange={handleChange(props.index, props.featured)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography className={classes.heading}>{props.title}</Typography>
          <Typography className={classes.secondaryHeading}>{props.description}</Typography>          
        </AccordionSummary>
        <AccordionDetails>
          <div>
            DOI: {props.doi}
          </div>
        </AccordionDetails>
        <Divider />
        <AccordionActions>
          <Button
            size="small"
            color="primary"
            disabled={props.uploading}
            onClick={() => uploadDataset()}
          >
            {props.uploading ? "USING DATASET..." : "USE DATASET"}
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  )
}

export default Dataset;

import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  Button,
  Divider,
  Link,
  Grid,
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
  link: {
    marginLeft: "6px",
  },
}));

const DOILink = (doi) => {

  if (doi !== undefined && doi.startsWith("http")) {
    return doi
  } else {
    return "https://doi.org/" + doi
  };

};

const BenchmarkDatasets = (props) => {

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
          <Typography className={classes.heading}>{props.authors}</Typography>
          <Typography className={classes.secondaryHeading}>{props.description}</Typography>          
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography className={classes.heading}>
                  {props.title}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography className={classes.heading} gutterBottom={true}>
                  DOI:
                  <Link
                    href={DOILink(props.doi)}
                    className={classes.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {props.doi}
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Typography className={classes.secondaryHeading}>
                  License:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={11}>
                <Typography className={classes.secondaryHeading}>
                  <Link
                    href={props.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {props.license}
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Typography className={classes.secondaryHeading}>
                  Location:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={11}>
                <Typography className={classes.secondaryHeading}>
                  <Link
                    href={props.location}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Link to the dataset
                  </Link>
                </Typography>
              </Grid>
            </Grid>
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

export default BenchmarkDatasets;

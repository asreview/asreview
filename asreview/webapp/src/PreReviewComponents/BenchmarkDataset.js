import React from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const PREFIX = "BenchmarkDataset";

const classes = {
  root: `${PREFIX}-root`,
  heading: `${PREFIX}-heading`,
  secondaryHeading: `${PREFIX}-secondaryHeading`,
  link: `${PREFIX}-link`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "100%",
    marginBottom: "5px",
  },

  [`& .${classes.heading}`]: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },

  [`& .${classes.secondaryHeading}`]: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },

  [`& .${classes.link}`]: {
    marginLeft: "6px",
  },
}));

const DOILink = (doi) => {
  if (doi !== undefined && doi.startsWith("http")) {
    return doi;
  } else {
    return "https://doi.org/" + doi;
  }
};

const BenchmarkDataset = (props) => {
  const handleChange = (index, featured) => (event, isExpanded) => {
    if (!props.uploading) {
      if (featured) {
        props.setExpanded((s) => {
          return {
            all: false,
            featured: isExpanded ? index : false,
          };
        });
      } else {
        props.setExpanded((s) => {
          return {
            all: isExpanded ? index : false,
            featured: false,
          };
        });
      }
    }
  };

  const uploadDataset = () => {
    // upload state
    props.setUploading(true);

    // send upload request to server
    props.onUploadHandler(props.dataset_id, resetState);
  };

  const resetState = () => {
    // props.setUploading(false);
  };

  return (
    <Root className={classes.root}>
      <Accordion
        expanded={props.expanded === props.index}
        onChange={handleChange(props.index, props.featured)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{props.authors}</Typography>
          <Typography className={classes.secondaryHeading}>
            {props.description}
          </Typography>
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
                  {props.doi && <Link
                      href={DOILink(props.doi)}
                      className={classes.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {props.doi}
                    </Link>
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Typography className={classes.secondaryHeading}>
                  License:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={11}>
                <Typography className={classes.secondaryHeading}>
                  <Link href={props.link} target="_blank" rel="noreferrer">
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
                  <Link href={props.location} target="_blank" rel="noreferrer">
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
            {props.uploading ? "UPLOADING DATASET..." : "USE DATASET"}
          </Button>
        </AccordionActions>
      </Accordion>
    </Root>
  );
};

export default BenchmarkDataset;

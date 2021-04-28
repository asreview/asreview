import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles((theme) => ({
  boxFullWidth: {
    paddingTop: 40,
    paddingBottom: 30,
    padding: theme.spacing(3),
    // height: 600,
    overflowY: "auto",
  },
  title: {
    lineHeight: 1.2,
  },
  titleDebug: {
    lineHeight: 1.2,
    color: theme.overrides.debug.color,
  },
  debug: {
    color: theme.overrides.debug.color,
  },
  abstract: {
    whiteSpace: "pre-line",
  },
  doi: {},
  publish_time: {},
  link: {
    marginLeft: "6px",
  },
  authors: {
    fontWeight: "bolder",
  },
  stickToBottom: {
    width: "100%",
    position: "fixed",
    bottom: 0,
  },
  chipLabel: {
    paddingBottom: theme.spacing(2.5),
  }
}));

const ArticlePanel = (props) => {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.boxFullWidth}>
      {/* Show the title */}
      <Typography
        className={classes.title}
        variant="h5"
        color="textSecondary"
        component="div"
        paragraph
      >
        {/* No title, inplace text */}
        {(props.record.title === "" || props.record.title === null) && (
          <Box className={"textSize" + props.textSize} fontStyle="italic">
            This document doesn't have a title.
          </Box>
        )}

        {/* No title, inplace text */}
        {!(props.record.title === "" || props.record.title === null) && (
          <Box className={"textSize" + props.textSize}>
            {props.record.title}
          </Box>
        )}
      </Typography>

      {/* Show the publication date if available */}
      {!(
        props.record.publish_time === undefined ||
        props.record.publish_time === null
      ) && (
        <Typography
          className={classes.publish_time + " textSize" + props.textSize}
          color="textSecondary"
          component="p"
          fontStyle="italic"
          paragraph
        >
          {props.record.publish_time}
        </Typography>
      )}

      {/* Show the publication date if available */}
      {!(props.record.doi === undefined || props.record.doi === null) && (
        <Typography
          className={classes.doi + " textSize" + props.textSize}
          color="textSecondary"
          component="p"
          fontStyle="italic"
          paragraph
        >
          DOI:
          <Link
            href={"https://doi.org/" + props.record.doi}
            className={classes.link}
            target="_blank"
            rel="noreferrer"
          >
            {props.record.doi}
          </Link>
        </Typography>
      )}

      {/* Flag for Exploration mode */}
      {props.record._debug_label === 1 && (
        <Typography className={classes.chipLabel}>
          <Chip label="Relevant" avatar={<Avatar>R</Avatar>} color="primary"/>
        </Typography>
      )}
      {props.record._debug_label === 0 && (
        <Typography className={classes.chipLabel}>
          <Chip label="Irrelevant" avatar={<Avatar>I</Avatar>} color="secondary"/>
        </Typography>
      )}

      {/* Show the abstract */}
      <Typography
        className={classes.abstract + " textSize" + props.textSize}
        variant="body2"
        color="textSecondary"
        component="div"
        paragraph
      >
        {/* No abstract, inplace text */}
        {(props.record.abstract === "" || props.record.abstract === null) && (
          <Box fontStyle="italic">This document doesn't have an abstract.</Box>
        )}

        {/* No abstract, inplace text */}
        {!(props.record.abstract === "" || props.record.abstract === null) && (
          <Box>{props.record.abstract}</Box>
        )}
      </Typography>
    </Container>
  );
};

export default ArticlePanel;

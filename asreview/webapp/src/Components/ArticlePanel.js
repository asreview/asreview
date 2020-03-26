import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Container,
  Slide,
  Typography,
} from '@material-ui/core'
import { reviewDrawerWidth } from '../globals.js'

const useStyles = makeStyles({
  boxFullWidth: {
    paddingTop: 40,
    paddingBottom: 30,
    // height: 600,
    overflowY: 'auto',
  },
  boxWithDrawer: {
    paddingTop: 40,
    paddingBottom: 30,
    // height: 600,
    overflowY: 'auto',
    paddingRight: reviewDrawerWidth+30,
  },
  title: {
    lineHeight: 1.2
  },
  abstract: {
  },
  authors: {
    fontWeight: "bolder"
  },
  stickToBottom: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
  },
});

const ArticlePanel = (props) => {
  const classes = useStyles();

  return (
    <Slide direction={props.slide.direction} in={props.slide.set} timeout={{ enter: 0, exit: 0 }} mountOnEnter={true}>
      <Container maxWidth="md" className={props.reviewDrawerState?classes.boxWithDrawer:classes.boxFullWidth}>
        <Typography
            className={classes.title}
            variant="h6"
            color={props.record._debug_label === 1 ? "error" : "textSecondary"}
            component="p"
            paragraph>
            {props.record.title}
            </Typography>
        <Typography
            className={classes.abstract}
            variant="body2"
            color={props.record._debug_label === 1 ? "error" : "textSecondary"}
            component="p"
            paragraph>
            {props.record.abstract}
        </Typography>
      </Container>
    </Slide>
  );
}

export default ArticlePanel;

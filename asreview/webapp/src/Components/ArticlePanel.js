import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
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
        
        {/* Show the title */}
        <Typography
          className={classes.title}
          variant="h6"
          color={props.record._debug_label === 1 ? "error" : "textSecondary"}
          component="div"
          paragraph>

          {/* No title, inplace text */}
          {(props.record.title === "" || props.record.title === null) &&
            <Box fontStyle="italic">
              This article doens't have a title.
            </Box>
          }

          {/* No title, inplace text */}
          {!(props.record.title === "" || props.record.title === null) &&
            <Box>
              {props.record.title}
            </Box>
          }
        </Typography>

        {/* Show the publication date if available */}
        {props.record.publish_time !== null  &&
          <Typography
              className={classes.publish_time}
              color={props.record._debug_label === 1 ? "error" : "textSecondary"}
              component="p"
              fontStyle="italic"
              paragraph>
              {props.record.publish_time}
          </Typography>
        }

        {/* Show the abstract */}
        <Typography
            className={classes.abstract}
            variant="body2"
            color={props.record._debug_label === 1 ? "error" : "textSecondary"}
            component="div"
            paragraph>

            {/* No abstract, inplace text */}
            {(props.record.abstract === "" || props.record.abstract === null) &&
              <Box fontStyle="italic">
                This article doens't have an abstract.
              </Box>
            }

            {/* No abstract, inplace text */}
            {!(props.record.abstract === "" || props.record.abstract === null) &&
              <Box>
                {props.record.abstract}
              </Box>
            }
        </Typography>
      </Container>
    </Slide>
  );
}

export default ArticlePanel;

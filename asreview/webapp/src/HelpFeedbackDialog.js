import React, { useEffect, useRef } from "react";
import {
  Avatar,
  Card,
  CardActionArea,
  CardHeader,
  Dialog,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@material-ui/core";

import FeedbackIcon from "@material-ui/icons/Feedback";
import DescriptionIcon from "@material-ui/icons/Description";
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import { AppBarWithinDialog, OpenInNewIconStyled } from "./Components";

const faq = [
  {
    title: "Has the use of ASReview in systematic reviews been validated?",
    link: "https://github.com/asreview/asreview/discussions/556",
  },
  {
    title: "What are the best ways to stop screening?",
    link: "https://github.com/asreview/asreview/discussions/557",
  },
  {
    title: "Can you do double screening in ASReview?",
    link: "https://github.com/asreview/asreview/discussions/550",
  },
  {
    title: "How to deal with records that do not have abstracts?",
    link: "https://github.com/asreview/asreview/discussions/553",
  },
  {
    title:
      "How can I add more publications while I have already started screening in ASReview?",
    link: "https://github.com/asreview/asreview/discussions/562",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 20,
  },
  subhead: {
    paddingLeft: 20,
  },
  descriptionIcon: {
    justifyContent: "center",
  },
  divider: {
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    width: "100%",
    marginLeft: 20,
    marginRight: 20,
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
  },
}));

const HelpFeedbackDialog = (props) => {
  const classes = useStyles();
  const descriptionElementRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (props.onHelpFeedback) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onHelpFeedback]);

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={props.onHelpFeedback}
        onClose={props.toggleHelpFeedback}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-helpfeedback"
      >
        <AppBarWithinDialog
          onClose={true}
          handleStartIcon={props.toggleHelpFeedback}
          title="Help"
        />
        <List className={classes.root}>
          <ListItem>
            <Typography className={classes.subhead} display="block">
              <b>Frequently asked questions</b>
            </Typography>
          </ListItem>
          {faq.map((element, index) => (
            <ListItem
              key={element.link}
              button
              component={"a"}
              href={element.link}
              target="_blank"
              alignItems="flex-start"
            >
              <ListItemIcon className={classes.descriptionIcon}>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                key={element.title}
                primary={
                  <React.Fragment>
                    {element.title} <OpenInNewIconStyled />
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
          <ListItem
            button
            component={"a"}
            href="https://asreview.readthedocs.io/en/latest/"
            target="_blank"
          >
            <ListItemIcon></ListItemIcon>
            <Typography display="block" color="primary">
              <b>Browse the documentation</b> <OpenInNewIconStyled />
            </Typography>
          </ListItem>

          <Divider className={classes.divider} />

          <ListItem>
            <Typography className={classes.subhead} display="block">
              <b>Need more help?</b>
            </Typography>
          </ListItem>
          <ListItem>
            <Card className={classes.card}>
              <CardActionArea
                href="https://github.com/asreview/asreview/discussions"
                target="_blank"
              >
                <CardHeader
                  avatar={
                    <Avatar className={classes.avatar}>
                      <QuestionAnswerIcon fontSize="small" />
                    </Avatar>
                  }
                  title={
                    <React.Fragment>
                      Ask the ASReview Community <OpenInNewIconStyled />
                    </React.Fragment>
                  }
                  subheader="Get answers from community experts"
                />
              </CardActionArea>
            </Card>
          </ListItem>

          <ListItem>
            <Card className={classes.card}>
              <CardActionArea
                href="https://github.com/asreview/asreview/issues/new/choose"
                target="_blank"
              >
                <CardHeader
                  avatar={
                    <Avatar className={classes.avatar}>
                      <FeedbackIcon fontSize="small" />
                    </Avatar>
                  }
                  title={
                    <React.Fragment>
                      Send Feedback <OpenInNewIconStyled />
                    </React.Fragment>
                  }
                  subheader="Report bugs or request features on GitHub"
                />
              </CardActionArea>
            </Card>
          </ListItem>

          <Divider className={classes.divider} />
        </List>
      </Dialog>
    </div>
  );
};

export default HelpFeedbackDialog;

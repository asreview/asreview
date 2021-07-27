import React, { useState, useEffect, useCallback, useRef } from "react";
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

import { UtilsAPI } from "./api/index.js";

import ErrorHandler from "./ErrorHandler";
import { AppBarWithinDialog, OpenInNewIconStyled } from "./Components";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: 20,
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

const HelpDialog = (props) => {
  const classes = useStyles();
  const descriptionElementRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [faq, setFaq] = useState(null);
  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const getFaq = useCallback(() => {
    UtilsAPI.faq()
      .then((result) => {
        setFaq(result.data);
      })
      .catch((error) => {
        setError({
          code: error.code,
          message: error.message,
        });
      });
  }, []);

  useEffect(() => {
    if (props.onHelp) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onHelp]);

  useEffect(() => {
    if (!error.message) {
      getFaq();
    }
  }, [getFaq, error.message]);

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={props.onHelp}
        onClose={props.toggleHelp}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-help"
      >
        <AppBarWithinDialog onClickStartIcon={props.toggleHelp} title="Help" />
        <List className={classes.root}>
          <ListItem>
            <Typography className={classes.subhead} display="block">
              <b>Frequently asked questions</b>
            </Typography>
          </ListItem>
          {faq &&
            faq.map((element, index) => (
              <ListItem
                key={element.url}
                button
                component={"a"}
                href={element.url}
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
          {!faq && <ErrorHandler error={error} setError={setError} />}
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
        </List>
      </Dialog>
    </div>
  );
};

export default HelpDialog;

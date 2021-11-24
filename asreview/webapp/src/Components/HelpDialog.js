import React, { useState, useEffect, useCallback, useRef } from "react";
import { connect } from "react-redux";
import {
  Avatar,
  Card,
  CardActionArea,
  CardHeader,
  Dialog,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Description, Feedback, QuestionAnswer } from "@mui/icons-material";

import ErrorHandler from "../ErrorHandler";
import { AppBarWithinDialog, OpenInNewIconStyled } from "../Components";

import { UtilsAPI } from "../api/index.js";
import { toggleHelpDialog } from "../redux/actions";

const mapStateToProps = (state) => {
  return {
    onHelpDialog: state.onHelpDialog,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleHelpDialog: () => {
      dispatch(toggleHelpDialog());
    },
  };
};

const HelpDialog = (props) => {
  const theme = useTheme();
  const descriptionElementRef = useRef(null);

  const [faq, setFaq] = useState(null);
  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const getFaq = useCallback(() => {
    UtilsAPI.faq()
      .then((result) => {
        setFaq(result);
      })
      .catch((error) => {
        setError({
          code: error.code,
          message: error.message,
        });
      });
  }, []);

  useEffect(() => {
    if (props.onHelpDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onHelpDialog]);

  useEffect(() => {
    if (!error.message) {
      getFaq();
    }
  }, [getFaq, error.message]);

  return (
    <Dialog
      fullScreen={props.mobileScreen}
      open={props.onHelpDialog}
      onClose={props.toggleHelpDialog}
      scroll="paper"
      fullWidth={true}
      maxWidth={"sm"}
      aria-labelledby="scroll-dialog-help"
    >
      <AppBarWithinDialog
        onClickStartIcon={props.toggleHelpDialog}
        title="Help"
      />
      <DialogContent sx={{ padding: "0px 0px 20px 0px" }}>
        <List>
          <ListItem>
            <Typography display="block" sx={{ paddingLeft: "20px" }}>
              <b>Frequently Asked Questions</b>
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
                <ListItemIcon sx={{ justifyContent: "center" }}>
                  <Description color="primary" />
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

          <Divider sx={{ marginTop: "8px", marginBottom: "8px" }} />

          <ListItem>
            <Typography display="block" sx={{ paddingLeft: "20px" }}>
              <b>Need more help?</b>
            </Typography>
          </ListItem>
          <ListItem>
            <Card
              sx={{ width: "100%", marginLeft: "20px", marginRight: "20px" }}
            >
              <CardActionArea
                href="https://github.com/asreview/asreview/discussions"
                target="_blank"
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        width: theme.spacing(4),
                        height: theme.spacing(4),
                        color: theme.palette.getContrastText(
                          theme.palette.primary.main
                        ),
                        backgroundColor: theme.palette.primary.main,
                      }}
                    >
                      <QuestionAnswer fontSize="small" />
                    </Avatar>
                  }
                  title={
                    <React.Fragment>
                      Ask the ASReview Community <OpenInNewIconStyled />
                    </React.Fragment>
                  }
                  subheader="Get answers from experts in the community"
                />
              </CardActionArea>
            </Card>
          </ListItem>

          <ListItem>
            <Card
              sx={{ width: "100%", marginLeft: "20px", marginRight: "20px" }}
            >
              <CardActionArea
                href="https://github.com/asreview/asreview/issues/new/choose"
                target="_blank"
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        width: theme.spacing(4),
                        height: theme.spacing(4),
                        color: theme.palette.getContrastText(
                          theme.palette.primary.main
                        ),
                        backgroundColor: theme.palette.primary.main,
                      }}
                    >
                      <Feedback fontSize="small" />
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
      </DialogContent>
    </Dialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HelpDialog);

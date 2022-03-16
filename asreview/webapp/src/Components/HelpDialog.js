import * as React from "react";
import { useQuery } from "react-query";
import { connect } from "react-redux";
import {
  Avatar,
  Card,
  CardActionArea,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  Close,
  Description,
  Feedback,
  QuestionAnswer,
} from "@mui/icons-material";

import {
  AppBarWithinDialog,
  BoxErrorHandler,
  OpenInNewIconStyled,
} from "../Components";
import { StyledIconButton } from "../StyledComponents/StyledButton.js";

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

const PREFIX = "HelpDialog";

const classes = {
  faq: `${PREFIX}-faq`,
  faqHeight: `${PREFIX}-faq-height`,
  contact: `${PREFIX}-contact`,
  contactAvatar: `${PREFIX}-contact-avatar`,
  divider: `${PREFIX}-divider`,
  sectionTitle: `${PREFIX}-section-title`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.faq}`]: {
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.faqHeight}`]: {
    minHeight: 353,
  },

  [`& .${classes.contact}`]: {
    width: "100%",
    marginLeft: 20,
    marginRight: 20,
  },

  [`& .${classes.contactAvatar}`]: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
  },

  [`& .${classes.divider}`]: {
    marginTop: 8,
    marginBottom: 8,
  },

  [`& .${classes.sectionTitle}`]: {
    paddingLeft: 20,
  },
}));

const HelpDialog = (props) => {
  const descriptionElementRef = React.useRef(null);

  const { data, error, isError, isFetched, isFetching } = useQuery(
    "fetchFAQ",
    UtilsAPI.fetchFAQ,
    {
      enabled: props.onHelpDialog,
      refetchOnWindowFocus: false,
    }
  );

  React.useEffect(() => {
    if (props.onHelpDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onHelpDialog]);

  return (
    <StyledDialog
      fullScreen={props.mobileScreen}
      open={props.onHelpDialog}
      onClose={props.toggleHelpDialog}
      scroll="paper"
      fullWidth
      maxWidth="sm"
    >
      {!props.mobileScreen && (
        <Stack className="dialog-header" direction="row" spacing={1}>
          <StyledIconButton className="dialog-header-button left-empty" />
          <DialogTitle>Help</DialogTitle>
          <Tooltip title="Close">
            <StyledIconButton
              className="dialog-header-button right"
              onClick={props.toggleHelpDialog}
            >
              <Close />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      )}
      {props.mobileScreen && (
        <AppBarWithinDialog
          onClickStartIcon={props.toggleHelpDialog}
          title="Help"
        />
      )}
      <DialogContent dividers sx={{ padding: "0px 0px 20px 0px" }}>
        <List className={classes.faqHeight}>
          <ListItem>
            <Typography className={classes.sectionTitle} display="block">
              <b>Frequently Asked Questions</b>
            </Typography>
          </ListItem>
          {!isError && isFetching && (
            <Stack className={classes.faq}>
              <CircularProgress />
            </Stack>
          )}
          {!isError &&
            isFetched &&
            data.map((element, index) => (
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
          {isError && (
            <Stack className={classes.faq}>
              <BoxErrorHandler error={error} queryKey="fetchFAQ" />
            </Stack>
          )}
          <ListItem
            button
            component={"a"}
            href={`https://asreview.readthedocs.io/en/latest/`}
            target="_blank"
          >
            <ListItemIcon></ListItemIcon>
            <Typography display="block" color="primary">
              <b>Browse the documentation</b> <OpenInNewIconStyled />
            </Typography>
          </ListItem>
        </List>
        <Divider className={classes.divider} />
        <List>
          <ListItem>
            <Typography className={classes.sectionTitle} display="block">
              <b>Need more help?</b>
            </Typography>
          </ListItem>
          <ListItem>
            <Card className={classes.contact}>
              <CardActionArea
                href={`https://github.com/asreview/asreview/discussions`}
                target="_blank"
              >
                <CardHeader
                  avatar={
                    <Avatar className={classes.contactAvatar}>
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
            <Card className={classes.contact}>
              <CardActionArea
                href="https://github.com/asreview/asreview/issues/new/choose"
                target="_blank"
              >
                <CardHeader
                  avatar={
                    <Avatar className={classes.contactAvatar}>
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
    </StyledDialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HelpDialog);

import * as React from "react";
import { useQuery } from "react-query";

import {
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  Close,
  Description,
  Feedback,
  QuestionAnswer,
} from "@mui/icons-material";

import { BoxErrorHandler, OpenInNewIconStyled } from "Components";

import { UtilsAPI } from "api";
import { feedbackURL } from "globals.js";

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

const HelpDialog = ({ mobileScreen, onHelp, toggleHelp }) => {
  const { data, error, isError, isFetched, isFetching } = useQuery(
    "fetchFAQ",
    UtilsAPI.fetchFAQ,
    {
      enabled: onHelp,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <StyledDialog
      fullScreen={mobileScreen}
      open={onHelp}
      onClose={toggleHelp}
      scroll="paper"
      fullWidth
      maxWidth="sm"
    >
      {!mobileScreen && <DialogTitle>Help</DialogTitle>}
      {mobileScreen && (
        <DialogTitle>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <IconButton onClick={toggleHelp}>
              <Close />
            </IconButton>
            Dialog Title
          </Grid>
        </DialogTitle>
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
              <CardActionArea href={feedbackURL} target="_blank">
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

      {!mobileScreen && (
        <DialogActions>
          <Button onClick={toggleHelp}>Close</Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default HelpDialog;

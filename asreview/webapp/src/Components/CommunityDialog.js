import * as React from "react";
import { useQuery } from "react-query";

import {
  Avatar,
  Card,
  CardActionArea,
  CardHeader,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import { Description, Feedback, QuestionAnswer } from "@mui/icons-material";

import { BoxErrorHandler, OpenInNewIconStyled } from "Components";

import { useMediaQuery } from "@mui/material";
import { UtilsAPI } from "api";
import { feedbackURL } from "globals.js";
import { StyledDialog } from "StyledComponents/StyledDialog";

const CommunityDialog = ({ onHelp, toggleHelp }) => {
  const { data, error, isError, isFetched } = useQuery(
    "fetchFAQ",
    UtilsAPI.fetchFAQ,
    {
      enabled: onHelp,
      refetchOnWindowFocus: false,
    },
  );

  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <StyledDialog
      fullScreen={mobileScreen}
      open={onHelp}
      onClose={toggleHelp}
      scroll="paper"
      fullWidth
      maxWidth="sm"
      title="Community and help"
    >
      <DialogContent dividers>
        <List>
          <ListItem>
            <Typography fontWeight={"bold"}>
              Frequently Asked Questions
            </Typography>
          </ListItem>
          {!isError &&
            isFetched &&
            data.map((element, index) => (
              <ListItem key={element.url}>
                <ListItemButton
                  component={"a"}
                  href={element.url}
                  target="_blank"
                  rel="noopener noreferrer"
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
                </ListItemButton>
              </ListItem>
            ))}
          {isError && (
            <Stack>
              <BoxErrorHandler error={error} queryKey="fetchFAQ" />
            </Stack>
          )}
          <ListItem
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
        <Divider sx={{ my: 2 }} />
        <List>
          <ListItem>
            <Typography fontWeight={"bold"}>Need more help?</Typography>
          </ListItem>
          <ListItem>
            <Card sx={{ width: "1" }}>
              <CardActionArea
                href={`https://github.com/asreview/asreview/discussions`}
                target="_blank"
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main" }}>
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
            <Card sx={{ width: "1" }}>
              <CardActionArea href={feedbackURL} target="_blank">
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main" }}>
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

export default CommunityDialog;

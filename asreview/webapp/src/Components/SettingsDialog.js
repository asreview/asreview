import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { Link } from "react-router-dom";

import { OpenInNewIconStyled } from "Components";

import { fontSizeOptions } from "globals.js";
import { useToggle } from "hooks/useToggle";

const PREFIX = "SettingsDialog";

const classes = {
  content: `${PREFIX}-content`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.content}`]: {
    height: 388,
  },
}));

const SettingsDialog = (props) => {
  const descriptionElementRef = React.useRef(null);

  // second layer state
  const [fontSizeSetting, toggleFontSizeSetting] = useToggle();
  const [fontSize, setFontSize] = React.useState(props.fontSize);

  const toggleBackMainSettings = () => {
    if (fontSizeSetting) {
      toggleFontSizeSetting();
    }
  };

  React.useEffect(() => {
    if (props.onSettings) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onSettings]);

  return (
    <StyledDialog
      fullScreen={props.mobileScreen}
      open={props.onSettings}
      onClose={props.toggleSettings}
      scroll="paper"
      fullWidth
      maxWidth="sm"
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      TransitionProps={{
        onExited: toggleBackMainSettings,
      }}
    >
      {!props.mobileScreen && (
        <DialogTitle>Customize your ASReview LAB</DialogTitle>
      )}
      {props.mobileScreen && (
        <DialogTitle>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <IconButton onClick={props.toggleSettings}>
              <Close />
            </IconButton>
            Customize
          </Grid>
        </DialogTitle>
      )}
      <DialogContent dividers className={classes.content}>
        <List>
          <ListItem>
            <Typography
              color="textSecondary"
              display="block"
              variant="subtitle2"
            >
              DISPLAY
            </Typography>
          </ListItem>
          <ListItem
            onClick={props.toggleDarkMode}
            secondaryAction={
              <Switch
                edge="end"
                onChange={props.toggleDarkMode}
                checked={props.onDark.palette.mode === "dark"}
                inputProps={{ "aria-labelledby": "switch-list-label-dark" }}
              />
            }
          >
            <ListItemText id="switch-list-label-dark" primary="Dark mode" />
          </ListItem>
          <Divider sx={{ my: "8px" }} />
          <ListItem>
            <Typography
              color="textSecondary"
              display="block"
              variant="subtitle2"
            >
              REVIEW
            </Typography>
          </ListItem>
          <ListItem onClick={toggleFontSizeSetting}>
            <ListItemText
              id="change-text-size"
              primary="Font size"
              secondary={fontSizeOptions[fontSize]}
            />
          </ListItem>
          <Divider sx={{ my: "8px" }} />
          <ListItem>
            <Typography
              color="textSecondary"
              display="block"
              variant="subtitle2"
            >
              OTHER
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemButton
              component={"a"}
              href="https://asreview.readthedocs.io/en/latest/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemText
                id="switch-list-label-about"
                primary={
                  <React.Fragment>
                    About ASReview LAB <OpenInNewIconStyled />
                  </React.Fragment>
                }
                secondary={`Version ${window.asreviewVersion}`}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
      {!props.mobileScreen && (
        <DialogActions>
          <Button onClick={props.toggleSettings}>Close</Button>
        </DialogActions>
      )}
      <Dialog open={fontSizeSetting} onClose={toggleFontSizeSetting}>
        <DialogTitle>Font size</DialogTitle>
        <DialogContent>
          <Box sx={{ pb: "20px" }}>
            <Typography>
              Make the text on the review screen smaller or larger.
            </Typography>
          </Box>
          <>
            <Typography
              align="center"
              gutterBottom
              className={"fontSize" + fontSizeOptions[fontSize]}
            >
              {fontSizeOptions[fontSize].charAt(0).toUpperCase() +
                fontSizeOptions[fontSize].slice(1)}
            </Typography>
          </>
          <>
            <Grid container sx={{ alignItems: "flex-end" }}>
              <Grid item size="grow">
                <Typography align="center" variant="h6">
                  A
                </Typography>
              </Grid>
              <Grid item size={8}>
                <Slider
                  value={fontSize}
                  marks={true}
                  step={1}
                  min={0}
                  max={3}
                  onChange={(event) => {
                    setFontSize(event.target.value);
                  }}
                />
              </Grid>
              <Grid item size="grow">
                <Typography align="center" variant="h4">
                  A
                </Typography>
              </Grid>
            </Grid>
          </>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleFontSizeSetting}>Cancel</Button>
          <Button
            onClick={() => {
              props.handleFontSizeChange(fontSize);
              toggleFontSizeSetting();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </StyledDialog>
  );
};

export default SettingsDialog;

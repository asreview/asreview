import {
  Close,
  DarkMode,
  LightMode,
  SettingsBrightness,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import React from "react";

import { OpenInNewIconStyled } from "Components";

import { fontSizeOptions } from "globals.js";
import { useToggle } from "hooks/useToggle";

import {
  useReviewSettings,
  useReviewSettingsDispatch,
} from "context/ReviewSettingsContext";

const SettingsDialog = (props) => {
  const descriptionElementRef = React.useRef(null);

  const { mode, setMode } = useColorScheme();

  // second layer state
  const [fontSizeSetting, toggleFontSizeSetting] = useToggle();
  const { fontSize } = useReviewSettings();
  const dispatchReviewSettings = useReviewSettingsDispatch();

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
    <Dialog
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
      <DialogContent dividers>
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
          <ListItem>
            <FormControl sx={{ margin: "auto" }}>
              <RadioGroup
                row
                name="theme-mode"
                defaultValue={mode}
                onChange={(event) => setMode(event.target.value)}
              >
                <FormControlLabel
                  value="system"
                  control={<Radio />}
                  label={
                    <Stack
                      direction="column"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <SettingsBrightness />
                      <Typography>System</Typography>
                    </Stack>
                  }
                  labelPlacement="top"
                  sx={{ px: 1 }}
                />
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label={
                    <Stack
                      direction="column"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <LightMode />
                      <Typography>Light</Typography>
                    </Stack>
                  }
                  labelPlacement="top"
                  sx={{ px: 1 }}
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label={
                    <Stack
                      direction="column"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <DarkMode />
                      <Typography>Dark</Typography>
                    </Stack>
                  }
                  labelPlacement="top"
                  sx={{ px: 1 }}
                />
              </RadioGroup>
            </FormControl>
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
              sx={{ height: "36px", overflow: "hidden" }}
            >
              {fontSizeOptions[fontSize].charAt(0).toUpperCase() +
                fontSizeOptions[fontSize].slice(1)}
            </Typography>
          </>
          <>
            <Stack direction={"row"} spacing={3}>
              <Typography variant="h6">A</Typography>
              <Slider
                value={fontSize}
                marks={true}
                step={1}
                min={0}
                max={3}
                onChange={(event) => {
                  dispatchReviewSettings({
                    type: "fontSize",
                    fontSize: event.target.value,
                  });
                }}
              />
              <Typography variant="h4">A</Typography>
            </Stack>
          </>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleFontSizeSetting}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default SettingsDialog;

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
  Switch,
  Typography,
  useMediaQuery,
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

const SettingsDialog = ({ onSettings, toggleSettings }) => {
  const descriptionElementRef = React.useRef(null);

  const { mode, setMode } = useColorScheme();

  // second layer state
  const [fontSizeSetting, toggleFontSizeSetting] = useToggle();
  const { fontSize, modelLogLevel, orientation } = useReviewSettings();

  const dispatchReviewSettings = useReviewSettingsDispatch();

  React.useEffect(() => {
    if (onSettings) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [onSettings]);

  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <Dialog
      fullScreen={mobileScreen}
      open={onSettings}
      onClose={toggleSettings}
      scroll="paper"
      fullWidth
      maxWidth="sm"
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      // TransitionProps={{
      //   onExited: toggleBackMainSettings,
      // }}
    >
      {!mobileScreen && <DialogTitle>Customize your ASReview LAB</DialogTitle>}
      {mobileScreen && (
        <DialogTitle>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <IconButton onClick={toggleSettings}>
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
          <Divider sx={{ my: 2 }} />
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
          <ListItem
            secondaryAction={
              <Switch
                checked={modelLogLevel === "info"}
                onChange={() => {
                  dispatchReviewSettings({
                    type: "modelLogLevel",
                    modelLogLevel:
                      modelLogLevel === "info" ? "warning" : "info",
                  });
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
          >
            <ListItemText
              id="change-show-model-info"
              primary="Show model information"
              secondary={"Warnings and errors are always shown"}
            />
          </ListItem>
          <ListItem
            secondaryAction={
              <Switch
                checked={orientation === "landscape"}
                onChange={() => {
                  dispatchReviewSettings({
                    type: "orientation",
                    orientation:
                      orientation === "portrait" ? "landscape" : "portrait",
                  });
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
          >
            <ListItemText
              id="change-show-model-info"
              primary="Screen in landscape view"
              secondary={"Useful for wide screens"}
            />
          </ListItem>
          <Divider sx={{ my: 2 }} />
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
      {!mobileScreen && (
        <DialogActions>
          <Button onClick={toggleSettings}>Close</Button>
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

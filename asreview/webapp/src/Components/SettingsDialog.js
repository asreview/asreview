import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  Slider,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { AppBarWithinDialog, OpenInNewIconStyled } from "../Components";
import { fontSizeOptions, donateURL } from "../globals.js";

const mapStateToProps = (state) => {
  return {
    asreview_version: state.asreview_version,
  };
};

const SettingsDialog = (props) => {
  const descriptionElementRef = useRef(null);

  // second layer state
  const [fontSizeSetting, setFontSizeSetting] = useState(false);
  const [shortcutSetting, setShortcutSetting] = useState(false);

  // second layer toggle
  const toggleFontSizeSetting = () => {
    setFontSizeSetting((a) => !a);
  };

  const toggleShortcutSetting = () => {
    setShortcutSetting((a) => !a);
  };

  // second layer font size setting
  const handleFontSize = (event, newValue) => {
    let fontSizeSelected = fontSizeOptions.find(
      (size) => size.value === newValue
    );
    if (fontSizeSelected !== props.fontSize) {
      props.handleFontSizeChange(fontSizeSelected);
    }
  };

  // second layer off when exiting dialog
  const exitSettings = () => {
    setFontSizeSetting(false);
    setShortcutSetting(false);
  };

  useEffect(() => {
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
      fullWidth={true}
      maxWidth={"sm"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      TransitionProps={{
        onExited: exitSettings,
      }}
    >
      {/*Main settings*/}
      {!fontSizeSetting && !shortcutSetting && (
        <AppBarWithinDialog
          onClickStartIcon={props.toggleSettings}
          title="Settings"
        />
      )}
      {!fontSizeSetting && !shortcutSetting && (
        <DialogContent sx={{ padding: "0px 0px 10px 0px" }}>
          <List>
            <ListItem>
              <ListItemIcon></ListItemIcon>
              <Typography
                color="textSecondary"
                display="block"
                variant="subtitle2"
              >
                DISPLAY
              </Typography>
            </ListItem>
            <ListItem button onClick={props.toggleDarkMode}>
              <ListItemIcon></ListItemIcon>
              <ListItemText id="switch-list-label-dark" primary="Dark mode" />
              <ListItemSecondaryAction sx={{ right: 24 }}>
                <Switch
                  edge="end"
                  onChange={props.toggleDarkMode}
                  checked={props.onDark.palette.mode === "dark"}
                  inputProps={{ "aria-labelledby": "switch-list-label-dark" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem button onClick={toggleFontSizeSetting}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                id="change-text-size"
                primary="Font size"
                secondary={props.fontSize.label}
              />
            </ListItem>
            <Divider sx={{ marginTop: "8px", marginBottom: "8px" }} />
            <ListItem>
              <ListItemIcon></ListItemIcon>
              <Typography
                color="textSecondary"
                display="block"
                variant="subtitle2"
              >
                REVIEW PREFERENCES
              </Typography>
            </ListItem>
            <ListItem button onClick={toggleShortcutSetting}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                id="switch-list-label-key"
                primary="Keyboard shortcuts"
                secondary={props.keyPressEnabled ? "On" : "Off"}
              />
            </ListItem>
            <ListItem button onClick={props.toggleUndoEnabled}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                id="switch-list-label-undo"
                primary="Undo"
                secondary="Allow returning to the previous decision"
              />
              <ListItemSecondaryAction sx={{ right: 24 }}>
                <Switch
                  edge="end"
                  onChange={props.toggleUndoEnabled}
                  checked={props.undoEnabled}
                  inputProps={{ "aria-labelledby": "switch-list-label-undo" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ marginTop: "8px", marginBottom: "8px" }} />
            <ListItem>
              <ListItemIcon></ListItemIcon>
              <Typography
                color="textSecondary"
                display="block"
                variant="subtitle2"
              >
                OTHER
              </Typography>
            </ListItem>
            <ListItem
              button
              component={"a"}
              href="https://asreview.readthedocs.io/en/latest/intro/about.html"
              target="_blank"
            >
              <ListItemIcon></ListItemIcon>
              <ListItemText
                id="switch-list-label-about"
                primary={
                  <React.Fragment>
                    About ASReview LAB <OpenInNewIconStyled />
                  </React.Fragment>
                }
                secondary={"Version " + props.asreview_version}
              />
            </ListItem>
            {donateURL !== undefined && (
              <ListItem button component={"a"} href={donateURL} target="_blank">
                <ListItemIcon></ListItemIcon>
                <ListItemText
                  id="switch-list-label-about"
                  primary={
                    <React.Fragment>
                      Donate to ASReview Development Fund{" "}
                      <OpenInNewIconStyled />
                    </React.Fragment>
                  }
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
      )}

      {/*Font size setting*/}
      {fontSizeSetting && (
        <AppBarWithinDialog
          startIconIsClose={false}
          onClickStartIcon={toggleFontSizeSetting}
          title="Font size"
        />
      )}
      {fontSizeSetting && (
        <DialogContent sx={{ padding: "0px 0px 10px 0px" }}>
          <Container
            maxWidth="md"
            sx={{ paddingTop: "10px", paddingBottom: "10px" }}
          >
            <Card sx={{ height: 500, overflowY: "scroll" }}>
              <CardContent>
                <Typography
                  variant="h5"
                  color="textSecondary"
                  component="div"
                  paragraph
                  sx={{ lineHeight: 1.2 }}
                >
                  <Box className={"fontSize" + props.fontSize.label}>
                    An open source machine learning framework for efficient and
                    transparent systematic reviews
                  </Box>
                </Typography>
                <Typography
                  className={"fontSize" + props.fontSize.label}
                  variant="body2"
                  color="textSecondary"
                  component="div"
                  paragraph
                >
                  <Box>
                    To help researchers conduct a systematic review or
                    meta-analysis as efficiently and transparently as possible,
                    we designed a tool to accelerate the step of screening
                    titles and abstracts. For many tasks—including but not
                    limited to systematic reviews and meta-analyses—the
                    scientific literature needs to be checked systematically.
                    Scholars and practitioners currently screen thousands of
                    studies by hand to determine which studies to include in
                    their review or meta-analysis. This is error prone and
                    inefficient because of extremely imbalanced data: only a
                    fraction of the screened studies is relevant. The future of
                    systematic reviewing will be an interaction with machine
                    learning algorithms to deal with the enormous increase of
                    available text. We therefore developed an open source
                    machine learning-aided pipeline applying active learning:
                    ASReview. We demonstrate by means of simulation studies that
                    active learning can yield far more efficient reviewing than
                    manual reviewing while providing high quality. Furthermore,
                    we describe the options of the free and open source research
                    software and present the results from user experience tests.
                    We invite the community to contribute to open source
                    projects such as our own that provide measurable and
                    reproducible improvements over current practice.
                  </Box>
                </Typography>
              </CardContent>
            </Card>
          </Container>
          <div style={{ paddingLeft: 48 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
          </div>
          <div>
            <Typography align="center" gutterBottom>
              {props.fontSize.label.charAt(0).toUpperCase() +
                props.fontSize.label.slice(1)}
            </Typography>
          </div>
          <div>
            <Grid container sx={{ alignItems: "flex-end" }}>
              <Grid item xs>
                <Typography align="center" variant="h6">
                  A
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Slider
                  value={props.fontSize.value}
                  marks={true}
                  step={1}
                  min={1}
                  max={4}
                  onChange={handleFontSize}
                />
              </Grid>
              <Grid item xs>
                <Typography align="center" variant="h4">
                  A
                </Typography>
              </Grid>
            </Grid>
          </div>
          <Box sx={{ padding: "10px 20px" }}>
            <Typography>
              Make the text on the review screen smaller or larger.
            </Typography>
          </Box>
        </DialogContent>
      )}

      {/*Keyboard shortcut setting*/}
      {shortcutSetting && (
        <AppBarWithinDialog
          startIconIsClose={false}
          onClickStartIcon={toggleShortcutSetting}
          title="Keyboard shortcuts"
        />
      )}
      {shortcutSetting && (
        <DialogContent sx={{ padding: "0px 0px 10px 0px" }}>
          <List>
            <ListItem button onClick={props.toggleKeyPressEnabled}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                id="switch-list-label-key"
                primary="Keyboard shortcuts"
                secondary="Label a record by pressing a key"
              />
              <ListItemSecondaryAction sx={{ right: 24 }}>
                <Switch
                  edge="end"
                  onChange={props.toggleKeyPressEnabled}
                  checked={props.keyPressEnabled}
                  inputProps={{ "aria-labelledby": "switch-list-label-key" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ marginTop: "8px", marginBottom: "8px" }} />
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                <InfoOutlinedIcon />
              </ListItemIcon>
              <ListItemText secondary="While screening, you can press a key (or a combination of keys) to label a record as relevant or irrelevant, or to return to the previous decision." />
            </ListItem>
            <ListItem>
              <ListItemIcon></ListItemIcon>
              <div style={{ flexGrow: 1 }}>
                <Grid container>
                  <Grid item style={{ width: 135 }}>
                    <Typography
                      color="textSecondary"
                      display="block"
                      variant="body2"
                    >
                      Press <b>R</b> or <b>Shift + R</b>:
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      color="textSecondary"
                      display="block"
                      variant="body2"
                    >
                      Label a record as relevant
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item style={{ width: 135 }}>
                    <Typography
                      color="textSecondary"
                      display="block"
                      variant="body2"
                    >
                      Press <b>I</b> or <b>Shift + I</b>:
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      color="textSecondary"
                      display="block"
                      variant="body2"
                    >
                      Label a record as irrelevant
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item style={{ width: 135 }}>
                    <Typography
                      color="textSecondary"
                      display="block"
                      variant="body2"
                    >
                      Press <b>U</b> or <b>Shift + U</b>:
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      color="textSecondary"
                      display="block"
                      variant="body2"
                    >
                      Return to the previous decision
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            </ListItem>
          </List>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default connect(mapStateToProps)(SettingsDialog);

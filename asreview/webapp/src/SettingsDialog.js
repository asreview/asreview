import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Dialog,
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
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";

import { AppBarWithinDialog } from "./Components";
import { fontSize } from "./globals.js";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 0,
  },
  subhead: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  listAction: {
    right: 24,
  },
  fontSizeSetting: {
    paddingLeft: 40,
    paddingBottom: 20,
  },
  fontSizeSampleContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  fontSizeSampleCard: {
    height: 500,
    overflowY: "scroll",
  },
  fontSizeSampleTitle: {
    lineHeight: 1.2,
  },
  fontSizeSampleAbstract: {
    whiteSpace: "pre-line",
  },
}));

export default function SettingsDialog(props) {
  const classes = useStyles();

  const descriptionElementRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [fontSizeSetting, setFontSizeSetting] = useState(false);
  const [shortcutSetting, setShortcutSetting] = useState(false);

  const openFontSizeSetting = () => {
    setFontSizeSetting(true);
  };

  const openShortcutSetting = () => {
    setShortcutSetting(true);
  };

  const onChangeFontSize = (event, newValue) => {
    let fontSizeSelected = fontSize.find((size) => size.value === newValue);
    if (fontSizeSelected !== props.textSize) {
      props.handleTextSizeChange(fontSizeSelected);
    }
  };

  const backMainSetting = () => {
    setFontSizeSetting(false);
    setShortcutSetting(false);
  };

  const closeSetting = () => {
    setFontSizeSetting(false);
    setShortcutSetting(false);
  };

  useEffect(() => {
    if (props.openSettings) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.openSettings]);

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={props.openSettings}
        onClose={props.handleClose}
        onExited={closeSetting}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {!fontSizeSetting && !shortcutSetting && (
          <AppBarWithinDialog
            closeIcon={true}
            leftIcon={props.handleClose}
            helpIcon="https://asreview.readthedocs.io/en/latest/features/settings.html"
            title="Settings"
          />
        )}
        {!fontSizeSetting && !shortcutSetting && (
          <List className={classes.root}>
            <ListItem>
              <ListItemIcon></ListItemIcon>
              <Typography
                className={classes.subhead}
                color="textSecondary"
                display="block"
                variant="subtitle2"
              >
                BASIC
              </Typography>
            </ListItem>
            <ListItem button onClick={props.toggleDarkMode}>
              <ListItemIcon></ListItemIcon>
              <ListItemText id="switch-list-label-dark" primary="Dark mode" />
              <ListItemSecondaryAction className={classes.listAction}>
                <Switch
                  edge="end"
                  onChange={props.toggleDarkMode}
                  checked={props.onDark.palette.type === "dark"}
                  inputProps={{ "aria-labelledby": "switch-list-label-dark" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon></ListItemIcon>
              <Typography
                className={classes.subhead}
                color="textSecondary"
                display="block"
                variant="subtitle2"
              >
                REVIEW SCREEN
              </Typography>
            </ListItem>
            <ListItem button onClick={openFontSizeSetting}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                id="change-text-size"
                primary="Font size"
                secondary={props.textSize.label}
              />
            </ListItem>
            <ListItem button onClick={openShortcutSetting}>
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
              <ListItemSecondaryAction className={classes.listAction}>
                <Switch
                  edge="end"
                  onChange={props.toggleUndoEnabled}
                  checked={props.undoEnabled}
                  inputProps={{ "aria-labelledby": "switch-list-label-undo" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        )}

        {fontSizeSetting && !shortcutSetting && (
          <AppBarWithinDialog
            closeIcon={false}
            leftIcon={backMainSetting}
            helpIcon="https://asreview.readthedocs.io/en/latest/features/settings.html#text-size"
            title="Font size"
          />
        )}
        {fontSizeSetting && !shortcutSetting && (
          <div>
            <Container
              className={classes.fontSizeSampleContainer}
              maxWidth="md"
            >
              <Card className={classes.fontSizeSampleCard}>
                <CardContent>
                  <Typography
                    className={classes.fontSizeSampleTitle}
                    variant="h5"
                    color="textSecondary"
                    component="div"
                    paragraph
                  >
                    <Box className={"textSize" + props.textSize.label}>
                      An open source machine learning framework for efficient
                      and transparent systematic reviews
                    </Box>
                  </Typography>
                  <Typography
                    className={
                      classes.fontSizeSampleAbstract +
                      " textSize" +
                      props.textSize.label
                    }
                    variant="body2"
                    color="textSecondary"
                    component="div"
                    paragraph
                  >
                    <Box>
                      To help researchers conduct a systematic review or
                      meta-analysis as efficiently and transparently as
                      possible, we designed a tool to accelerate the step of
                      screening titles and abstracts. For many tasks—including
                      but not limited to systematic reviews and
                      meta-analyses—the scientific literature needs to be
                      checked systematically. Scholars and practitioners
                      currently screen thousands of studies by hand to determine
                      which studies to include in their review or meta-analysis.
                      This is error prone and inefficient because of extremely
                      imbalanced data: only a fraction of the screened studies
                      is relevant. The future of systematic reviewing will be an
                      interaction with machine learning algorithms to deal with
                      the enormous increase of available text. We therefore
                      developed an open source machine learning-aided pipeline
                      applying active learning: ASReview. We demonstrate by
                      means of simulation studies that active learning can yield
                      far more efficient reviewing than manual reviewing while
                      providing high quality. Furthermore, we describe the
                      options of the free and open source research software and
                      present the results from user experience tests. We invite
                      the community to contribute to open source projects such
                      as our own that provide measurable and reproducible
                      improvements over current practice.
                    </Box>
                  </Typography>
                </CardContent>
              </Card>
            </Container>
            <div>
              <Typography
                className={classes.fontSizeSetting}
                variant="h6"
                gutterBottom
              >
                Preview
              </Typography>
            </div>
            <div>
              <Typography align="center" gutterBottom>
                {props.textSize.label.charAt(0).toUpperCase() +
                  props.textSize.label.slice(1)}
              </Typography>
            </div>
            <div>
              <Grid container>
                <Grid item xs>
                  <Typography align="center" variant="h6">
                    A
                  </Typography>
                </Grid>
                <Grid item xs={8} style={{ paddingTop: 5 }}>
                  <Slider
                    value={props.textSize.value}
                    marks={true}
                    step={1}
                    min={1}
                    max={4}
                    onChange={onChangeFontSize}
                  />
                </Grid>
                <Grid item xs>
                  <Typography align="center" variant="h4">
                    A
                  </Typography>
                </Grid>
              </Grid>
            </div>
            <div className={classes.fontSizeSetting}>
              <Typography>
                Make the text on the review screen smaller or larger.
              </Typography>
            </div>
          </div>
        )}

        {shortcutSetting && !fontSizeSetting && (
          <AppBarWithinDialog
            closeIcon={false}
            leftIcon={backMainSetting}
            helpIcon="https://asreview.readthedocs.io/en/latest/features/screening.html#keyboard-shortcuts"
            title="Keyboard shortcuts"
          />
        )}
        {shortcutSetting && !fontSizeSetting && (
          <div>
            <List>
              <ListItem button onClick={props.toggleKeyPressEnabled}>
                <ListItemIcon></ListItemIcon>
                <ListItemText
                  id="switch-list-label-key"
                  primary="Keyboard shortcuts"
                  secondary="Label a record by pressing a key"
                />
                <ListItemSecondaryAction className={classes.listAction}>
                  <Switch
                    edge="end"
                    onChange={props.toggleKeyPressEnabled}
                    checked={props.keyPressEnabled}
                    inputProps={{ "aria-labelledby": "switch-list-label-key" }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InfoOutlinedIcon />
                </ListItemIcon>
                <ListItemText secondary="While screening, you can press a key (or a combination of keys) to label a record as relevant or irrelevant, or to return to the previous decision." />
              </ListItem>
              <ListItem>
                <ListItemIcon></ListItemIcon>
                <ListItemText
                  primary="Press r or Shift + r"
                  secondary="Relevant"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon></ListItemIcon>
                <ListItemText
                  primary="Press i or Shift + i"
                  secondary="Irrelevant"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon></ListItemIcon>
                <ListItemText
                  primary="Press u or Shift + u"
                  secondary="Return to the previous record"
                />
              </ListItem>
            </List>
          </div>
        )}
      </Dialog>
    </div>
  );
}

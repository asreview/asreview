import React, { useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CardHeader,
  CardContent,
  Divider,
  Tooltip,
  IconButton,
  Grow,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { green, brown } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import HelpIcon from "@mui/icons-material/Help";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

import {
  PriorKnowledgeSearch,
  PriorKnowledgeRandom,
  LabeledItems,
} from "../PreReviewComponents";
import { DialogTitleWithClose } from "../Components";
import { Help, useHelp } from "../PreReviewComponents";
import { ProjectAPI } from "../api/index.js";

import "./ReviewZone.css";

const PREFIX = "PriorKnowledge";

const classes = {
  paperRoot: `${PREFIX}-paperRoot`,
  button: `${PREFIX}-button`,
  margin: `${PREFIX}-margin`,
  helpertext: `${PREFIX}-helpertext`,
  root: `${PREFIX}-root`,
  input: `${PREFIX}-input`,
  iconButton: `${PREFIX}-iconButton`,
  divider: `${PREFIX}-divider`,
  help: `${PREFIX}-help`,
  helptext: `${PREFIX}-helptext`,
  avatar: `${PREFIX}-avatar`,
  navButton: `${PREFIX}-navButton`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.paperRoot}`]: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    marginBottom: "32px",
    minHeight: "200px",
  },

  [`& .${classes.button}`]: {
    margin: "36px 0px 24px 12px",
    float: "right",
  },

  [`& .${classes.margin}`]: {
    marginTop: 20,
  },

  [`& .${classes.helpertext}`]: {
    color: "#FF0000",
  },

  [`& .${classes.root}`]: {
    padding: "2px 4px",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },

  [`& .${classes.input}`]: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },

  [`& .${classes.iconButton}`]: {
    padding: 10,
  },

  [`& .${classes.divider}`]: {
    height: 28,
    margin: 4,
  },

  [`& .${classes.help}`]: {
    textAlign: "right",
  },

  [`& .${classes.helptext}`]: {
    padding: "12px 0px",
  },

  [`& .${classes.avatar}`]: {
    color: theme.palette.getContrastText(brown[500]),
    backgroundColor: brown[500],
  },

  [`& .${classes.navButton}`]: {
    margin: "0px 12px",
  },
}));


const PriorKnowledge = ({ project_id, setNext, scrollToBottom }) => {
  const [state, setState] = React.useState({
    method: null,
    loading: true,
  });

  const [priorDialog, setPriorDialog] = React.useState(false);

  const [priorStats, setPriorStats] = React.useState({
    n_prior_exclusions: null,
    n_prior_inclusions: null,
    n_prior: null,
  });
  const [help, openHelp, closeHelp] = useHelp();

  const updatePriorStats = () => {
    setState({
      method: state.method,
      loading: true,
    });
  };

  const openPriorKnowledge = () => {
    // open resultdialog
    setPriorDialog(true);
  };

  const closePriorKnowledge = () => {
    // open resultdialog
    setPriorDialog(false);
  };

  /* Skeleton to extend later on */
  const changeMethod = (method) => {
    setState({
      method: method,
      loading: state.loading,
    });
  };

  // const goToAlgorithms = useCallback(v => {
  //    setNext(v);
  //  }, [setNext])

  useEffect(() => {
    if (state.loading) {
      ProjectAPI.labeled_stats(project_id)
        .then((result) => {
          setState((s) => {
            return {
              ...s,
              loading: false,
            };
          });

          setPriorStats(result.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [state.loading, project_id]);

  // check if there is enough prior knowledge
  useEffect(() => {
    if (priorStats["n_prior_inclusions"] > 0 && priorStats["n_prior_exclusions"] > 0) {
      setNext(true);
    } else {
      setNext(false);
    }
  }, [priorStats, setNext]);

  return (
    <StyledBox style={{ clear: "both" }}>
      {/* Display the prior info once loaded */}
      {priorStats.n_prior !== null && (
        <Grow in={true}>
          <Paper className="Card">
            <CardHeader
              /* Prior card */
              title="Select prior knowledge"
              titleTypographyProps={{ color: "primary" }}
              /* The edit and help options */
              action={
                <Box>
                  {priorStats["n_prior"] > 0 && (
                    <Tooltip title="Edit">
                      <IconButton
                        aria-label="project-prior-edit"
                        onClick={openPriorKnowledge}
                        size="large"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Help">
                    <IconButton
                      onClick={openHelp}
                      aria-label="project-prior-help"
                      size="large"
                    >
                      <HelpIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />

            <CardContent className="cardHighlight">
              <Typography variant="h4" noWrap={true}>
                {priorStats["n_prior_inclusions"]} relevant documents
              </Typography>
              <Typography variant="h4" noWrap={true}>
                {priorStats["n_prior_exclusions"]} irrelevant documents
              </Typography>
              <Box>
                {/* nothing */}
                {priorStats["n_prior_inclusions"] === 0 &&
                  priorStats["n_prior_exclusions"] === 0 && (
                    <Typography>
                      You don't have prior knowledge yet. Find yourself prior
                      knowledge by searching relevant documents and label some
                      random documents.
                    </Typography>
                  )}

                {/* only inclusions, no exclusions */}
                {priorStats["n_prior_inclusions"] > 0 &&
                  priorStats["n_prior_exclusions"] === 0 && (
                    <Typography>
                      Find yourself irrelevant documents. Tip: label some random
                      documents. Random documents are usually exclusions because
                      the relevant documents are rare.
                    </Typography>
                  )}

                {/* only exclusions, no inclusions */}
                {priorStats["n_prior_inclusions"] === 0 &&
                  priorStats["n_prior_exclusions"] > 0 && (
                    <Typography>
                      Find yourself relevant documents. Tip: use the search
                      function and find some relevant documents you know of.
                    </Typography>
                  )}

                {/* bare minimum was met */}
                {priorStats["n_prior_inclusions"] > 0 &&
                  priorStats["n_prior_exclusions"] > 0 &&
                  (priorStats["n_prior_exclusions"] < 3 ||
                    priorStats["n_prior_inclusions"] < 3) && (
                    <Typography>
                      <CheckIcon />
                      Enough prior knowledge, however a bit more would help!
                    </Typography>
                  )}

                {/* ready */}
                {priorStats["n_prior_inclusions"] >= 3 &&
                  priorStats["n_prior_exclusions"] >= 3 && (
                    <Typography style={{ color: green[500] }}>
                      <CheckIcon />
                      Enough prior knowledge, feel free to go to the next step.
                    </Typography>
                  )}
              </Box>
            </CardContent>

            <CardContent className="cardHighlight">
              <Button
                variant="outlined"
                color="primary"
                disabled={state.method === "search"}
                onClick={() => {
                  changeMethod("search");
                }}
                className={classes.navButton}
              >
                Search
              </Button>

              <Button
                variant="outlined"
                color="primary"
                disabled={state.method === "random"}
                onClick={() => {
                  changeMethod("random");
                }}
                className={classes.navButton}
              >
                Random
              </Button>

              {/*
            <Button
              variant="outlined"
              color="primary"
              disabled={state.method === "file"}
              onClick={() => {changeMethod("file")}}
              className={classes.navButton}
            >
              From file
            </Button>
            */}
            </CardContent>

            {state.method === "search" && (
              <Box>
                <Divider />
                <CardContent>
                  <PriorKnowledgeSearch
                    project_id={project_id}
                    updatePriorStats={updatePriorStats}
                  />
                </CardContent>
              </Box>
            )}

            {state.method === "random" && (
              <PriorKnowledgeRandom
                project_id={project_id}
                updatePriorStats={updatePriorStats}
                onClose={() => {
                  changeMethod(null);
                }}
              />
            )}
          </Paper>
        </Grow>
      )}

      {/* Prior dialog */}
      <Dialog open={priorDialog} onClose={closePriorKnowledge} fullWidth={true}>
        <DialogTitleWithClose
          title={"Prior Knowledge"}
          onClose={closePriorKnowledge}
        />
        <DialogContent dividers={true}>
          <LabeledItems 
            updatePriorStats={updatePriorStats}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closePriorKnowledge} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Help
        open={help}
        onClose={closeHelp}
        title="Prior Knowledge"
        message={
          <Box>
            <Typography variant="body2" gutterBottom>
              Providing the prior knowledge gives the active learning model a
              head start.
            </Typography>
            <Typography variant="body2" gutterBottom>
              Select at least 1 relevant and 1 irrelevant records. Relevant
              records can be found by searching for keywords, authors or titles.
              Irrelevant records can be drawn randomly from the dataset.
            </Typography>
          </Box>
        }
      />
    </StyledBox>
  );
};

export default PriorKnowledge;

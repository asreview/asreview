import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { PaperCard } from "../PreReviewComponents";
import { DialogTitleWithClose } from "../Components";
import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";

const PREFIX = "PriorKnowledgeRandom";

const classes = {
  button: `${PREFIX}-button`,
  margin: `${PREFIX}-margin`,
  root: `${PREFIX}-root`,
  input: `${PREFIX}-input`,
  iconButton: `${PREFIX}-iconButton`,
  divider: `${PREFIX}-divider`,
  loader: `${PREFIX}-loader`,
  clear: `${PREFIX}-clear`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.button}`]: {
    margin: "36px 0px 24px 12px",
    float: "right",
  },

  [`& .${classes.margin}`]: {
    marginTop: 20,
  },

  [`& .${classes.root}`]: {
    padding: "2px 4px",
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

  [`& .${classes.loader}`]: {
    width: "100%",
  },

  [`& .${classes.clear}`]: {
    clear: "both",
  },
}));

const n_items = 5;

const PriorKnowledgeRandom = (props) => {
  const [state, setState] = useState({
    count_inclusions: 0,
    count_exclusions: 0,
    records: null,
    loaded: false,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const includeRandomDocument = () => {
    props.includeItem(state["records"].id, () => {
      setState({
        count_inclusions: state["count_inclusions"] + 1,
        count_exclusions: state["count_exclusions"],
        records: null,
        loaded: false,
      });

      props.updatePriorStats();
    });
  };

  const excludeRandomDocument = () => {
    props.excludeItem(state["records"].id, () => {
      setState({
        count_inclusions: state["count_inclusions"],
        count_exclusions: state["count_exclusions"] + 1,
        records: null,
        loaded: false,
      });

      props.updatePriorStats();
    });
  };

  const resetCount = () => {
    setState({
      count_inclusions: 0,
      count_exclusions: 0,
      records: null,
      loaded: false,
    });
  };

  useEffect(() => {
    const getDocument = () => {
      return ProjectAPI.prior_random(props.project_id)
        .then((result) => {
          setState({
            count_inclusions: state.count_inclusions,
            count_exclusions: state.count_exclusions,
            records: result.data["result"][0],
            loaded: true,
          });
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    };

    if (!state.loaded) {
      getDocument();
    }
  }, [
    props.project_id,
    state.loaded,
    state.count_inclusions,
    state.count_exclusions,
    error.message,
  ]);

  return (
    <StyledDialog open={true} onClose={props.onClose} fullWidth={true}>
      {state["count_exclusions"] < n_items && (
        <DialogTitleWithClose
          title={"Prior Knowledge: Is this document relevant or irrelevant?"}
          onClose={props.onClose}
        />
      )}
      {state["count_exclusions"] < n_items && (
        <DialogContent dividers={true}>
          {error.message !== null && (
            <ErrorHandler error={error} setError={setError} />
          )}
          {error.message === null && (
            <div>
              {!state["loaded"] ? (
                <Box className={classes.loader}>
                  <CircularProgress style={{ margin: "0 auto" }} />
                </Box>
              ) : (
                <PaperCard
                  id={state["records"].id}
                  title={state["records"].title}
                  abstract={state["records"].abstract}
                />
              )}
            </div>
          )}
        </DialogContent>
      )}
      {error.message === null && state["count_exclusions"] < n_items && (
        <DialogActions>
          <Button
            onClick={() => excludeRandomDocument(props.id)}
            color="primary"
          >
            Irrelevant
          </Button>
          <Button
            onClick={() => includeRandomDocument(props.id)}
            color="primary"
          >
            Relevant
          </Button>
        </DialogActions>
      )}

      {state["count_exclusions"] >= n_items && (
        <Box>
          <DialogTitleWithClose
            title={"Enough irrelevant documents found, do you want to stop?"}
            onClose={props.onClose}
          />
          <DialogContent dividers={true}>
            {error.message !== null && (
              <ErrorHandler error={error} setError={setError} />
            )}
            {error.message === null && (
              <Typography>
                {n_items} Random documents were marked as 'irrelevant'. Usually,
                this is enough prior knowledge to start the review (make sure
                you do have enough relevant documents as well).
              </Typography>
            )}
          </DialogContent>

          {error.message === null && (
            <DialogActions>
              <Button onClick={resetCount} color="primary">
                Show more
              </Button>
              <Button onClick={props.onClose} color="primary">
                Stop
              </Button>
            </DialogActions>
          )}
        </Box>
      )}
    </StyledDialog>
  );
};

export default PriorKnowledgeRandom;

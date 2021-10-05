import React from "react";
import {
  Box,
  IconButton,
  Link,
  ListSubheader,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";

import { ProgressAreaChart } from "../SideStats";

const PREFIX = "ProgressPanel";

const classes = {
  item: `${PREFIX}-item`,
  areaChart: `${PREFIX}-areaChart`,
  errorMessage: `${PREFIX}-errorMessage`,
  link: `${PREFIX}-link`,
  retryButton: `${PREFIX}-retryButton`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.item}`]: {
    margin: "10px 0px 10px 0px",
  },

  [`& .${classes.areaChart}`]: {
    paddingRight: "40px",
    paddingLeft: "40px",
  },

  [`& .${classes.errorMessage}`]: {
    paddingTop: "38px",
    textAlign: "center",
  },

  [`& .${classes.link}`]: {
    paddingLeft: "3px",
  },

  [`& .${classes.retryButton}`]: {
    position: "relative",
    top: "8px",
    paddingBottom: "28px",
  },
}));

const ProgressPanel = (props) => {
  const handleClickRetry = () => {
    props.setSideSheetError(false);
  };

  return (
    <Root>
      {props.sideSheetError && (
        <Box>
          <Box className={classes.errorMessage}>
            <Typography>Failed to load statistics.</Typography>
            <Box fontStyle="italic">
              <Typography variant="body2" align="center">
                If the issue remains after refreshing, click
                <Link
                  className={classes.link}
                  href="https://github.com/asreview/asreview/issues/new/choose"
                  target="_blank"
                >
                  <strong>here</strong>
                </Link>{" "}
                to report.
              </Typography>
            </Box>
          </Box>
          <Box className={classes.retryButton} align="center">
            <Tooltip title="Refresh">
              <IconButton
                color="primary"
                onClick={handleClickRetry}
                size="large"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      {!props.sideSheetError && (
        <div>
          <ListSubheader component="div" id="list-subheader-progress">
            Progress
          </ListSubheader>
          <ListItem style={{ marginBottom: 10 }} key="project-n-papers">
            Total records: {props.n_papers}
          </ListItem>
          <ListItem className={classes.item} key="list-progress-total_labeled">
            Total reviewed: {props.n_included + props.n_excluded} (
            {Math.round(
              ((props.n_included + props.n_excluded) / props.n_papers) * 10000
            ) / 100}
            %)
          </ListItem>
          <ListItem className={classes.item} key="n_since_last_inclusion">
            Records since last relevant: {props.n_since_last_inclusion}
          </ListItem>
          <Box className={classes.areaChart}>
            <ProgressAreaChart history={props.history} />
          </Box>
        </div>
      )}
    </Root>
  );
};

export default ProgressPanel;

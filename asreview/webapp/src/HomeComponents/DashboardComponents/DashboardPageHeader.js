import { Box, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { projectModes } from "globals.js";

const PREFIX = "DashboardPageHeader";

const classes = {
  paperHeader: `${PREFIX}-paper-header`,
};

const Root = styled(Box)(({ theme }) => ({
  [`& .${classes.paperHeader}`]: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(5),
    margin: theme.spacing(2),
    // backgroundColor: theme.palette.primary.main,
    textAlign: "center",
    height: "160px",
    color: theme.palette.primary.main,
  },
}));

// const modeLabelMap = {
//   simulate: "Simulation",
//   oracle: "Review",
// };

export default function DashboardPageHeader({ mode }) {
  return (
    <Root>
      <Paper className={classes.paperHeader} elevation={0}>
        {mode === projectModes.ORACLE && (
          <Typography variant="h4">What do you read today?</Typography>
        )}
        {mode === projectModes.SIMULATION && (
          <Typography variant="h4">
            Simulate a review, fully automated
          </Typography>
        )}
      </Paper>
    </Root>
  );
}

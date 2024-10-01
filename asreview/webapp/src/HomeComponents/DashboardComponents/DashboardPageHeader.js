import { Box, Paper, Typography, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

import { projectModes } from "globals.js";

import NewProjectButton from "./NewProjectButton";
import ImportProject from "ProjectComponents/ImportProject";

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
    color: theme.palette.primary.main,
  },
}));

export default function DashboardPageHeader({ mode }) {
  return (
    <Root>
      <Paper className={classes.paperHeader} elevation={0}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={7}
        >
          <Typography variant="h4">
            {mode === projectModes.ORACLE && "What do you read today?"}
            {mode === projectModes.SIMULATION &&
              "Simulate a review, fully automated"}
          </Typography>
          <Stack direction="row" spacing={2}>
            <NewProjectButton mode={mode} />
            <ImportProject />
          </Stack>
        </Stack>
      </Paper>
    </Root>
  );
}

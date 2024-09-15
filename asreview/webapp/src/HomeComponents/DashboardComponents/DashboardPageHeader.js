import { Upload } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

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
    height: "200px",
    color: theme.palette.primary.main,
  },
}));

// const modeLabelMap = {
//   simulate: "Simulation",
//   oracle: "Review",
// };

export default function DashboardPageHeader({ toggleImportProject, mode }) {
  const theme = useTheme();
  const mobileScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Root>
      <Paper className={classes.paperHeader} elevation={0}>
        {mode === projectModes.ORACLE && (
          <Typography variant="h4">What do you read today?</Typography>
        )}
        {mode === projectModes.SIMULATION && (
          <Typography variant="h4">Simulation projects</Typography>
        )}

        <Stack direction="row" spacing={1}>
          {mobileScreen && (
            <Tooltip title="Import project">
              <IconButton disableRipple onClick={toggleImportProject}>
                <Avatar>
                  <Upload
                    color="primary"
                    fontSize={!mobileScreen ? "medium" : "small"}
                  />
                </Avatar>
              </IconButton>
            </Tooltip>
          )}

          {!mobileScreen && (
            <Button variant="outlined" onClick={toggleImportProject}>
              Import project
            </Button>
          )}
        </Stack>
      </Paper>
    </Root>
  );
}

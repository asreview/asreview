import React from "react";
import { Box, Fab, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import "./ReviewPage.css";

const PREFIX = "DecisionButton";

const classes = {
  extendedFab: `${PREFIX}-extendedFab`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.extendedFab}`]: {
    marginRight: theme.spacing(1),
  },
}));

const DecisionButton = (props) => {
  let relevantLabel = "Relevant";
  let irrelevantLabel = "Irrelevant";

  if (props.previousRecord.show) {
    if (props.previousRecord.label === 0) {
      relevantLabel = "Convert to relevant";
      irrelevantLabel = "Keep irrelevant";
    }
    if (props.previousRecord.label === 1) {
      relevantLabel = "Keep relevant";
      irrelevantLabel = "Convert to irrelevant";
    }
  }

  return (
    <Root>
      <Stack
        className="review-page-decision-button"
        direction={
          !props.mobileScreen
            ? "row"
            : !props.previousRecord.show
            ? "row"
            : "column"
        }
        spacing={!props.mobileScreen ? 10 : !props.previousRecord.show ? 10 : 2}
      >
        <Box>
          <Fab
            disabled={props.disableButton()}
            onClick={() => props.makeDecision(0)}
            size={props.mobileScreen ? "small" : "large"}
            variant="extended"
          >
            <FavoriteBorder className={classes.extendedFab} />
            {irrelevantLabel}
          </Fab>
        </Box>
        <Box>
          <Fab
            onClick={() => props.makeDecision(1)}
            color="primary"
            disabled={props.disableButton()}
            size={props.mobileScreen ? "small" : "large"}
            variant="extended"
          >
            <Favorite className={classes.extendedFab} />
            {relevantLabel}
          </Fab>
        </Box>
      </Stack>
    </Root>
  );
};

export default DecisionButton;

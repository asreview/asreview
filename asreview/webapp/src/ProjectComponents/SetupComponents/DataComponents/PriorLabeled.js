import * as React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { LabelChip, LabeledRecord } from "../../HistoryComponents";

const PREFIX = "PriorLabeled";

const classes = {
  root: `${PREFIX}-root`,
  noPrior: `${PREFIX}-no-prior`,
};

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  [`& .${classes.root}`]: {
    height: "100%",
  },

  [`& .${classes.noPrior}`]: {
    height: "calc(100% - 56px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [`${theme.breakpoints.down("md")} and (orientation: landscape)`]: {
      height: "calc(100% - 64px)",
    },
  },
}));

const PriorLabeled = (props) => {
  const [label, setLabel] = React.useState("relevant");

  return (
    <Root>
      <Box
        className={classes.root}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        }}
      >
        <LabelChip
          label={label}
          priorLabeledStats={props.priorLabeledStats}
          setLabel={setLabel}
          mobileScreen={props.mobileScreen}
        />
        <Divider />
        <LabeledRecord
          label={label}
          is_prior={true}
          priorLabeledStats={props.priorLabeledStats}
        />
        {((label === "relevant" &&
          props.priorLabeledStats?.n_prior_inclusions === 0) ||
          (label === "irrelevant" &&
            props.priorLabeledStats?.n_prior_exclusions === 0)) && (
          <Box className={classes.noPrior}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {`You have not labeled ${label} prior knowledge`}
            </Typography>
          </Box>
        )}
        {label === "all" && props.priorLabeledStats?.n_prior === 0 && (
          <Box className={classes.noPrior}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {`You have not labeled prior knowledge`}
            </Typography>
          </Box>
        )}
      </Box>
    </Root>
  );
};

export default PriorLabeled;

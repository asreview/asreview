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

export default function PriorLabeled(props) {
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
          setLabel={setLabel}
          mobileScreen={props.mobileScreen}
          n_prior_exclusions={props.n_prior_exclusions}
          n_prior_inclusions={props.n_prior_inclusions}
        />
        <Divider />
        <LabeledRecord
          label={label}
          is_prior={true}
          n_prior={props.n_prior}
          n_prior_exclusions={props.n_prior_exclusions}
          n_prior_inclusions={props.n_prior_inclusions}
        />
        {((label === "relevant" && props.n_prior_inclusions === 0) ||
          (label === "irrelevant" && props.n_prior_exclusions === 0)) && (
          <Box className={classes.noPrior}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {`You have not labeled ${label} prior knowledge`}
            </Typography>
          </Box>
        )}
        {label === "all" && props.n_prior === 0 && (
          <Box className={classes.noPrior}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {`You have not labeled prior knowledge`}
            </Typography>
          </Box>
        )}
      </Box>
    </Root>
  );
}

import * as React from "react";
import { useQueryClient } from "react-query";
import { connect } from "react-redux";

import { Box, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { LabelChip, LabeledRecord } from "../../HistoryComponents";
import { mapStateToProps } from "../../../globals";

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
  const queryClient = useQueryClient();
  const [label, setLabel] = React.useState("relevant");

  const { n_prior, n_prior_exclusions, n_prior_inclusions } =
    queryClient.getQueryData([
      "fetchLabeledStats",
      { project_id: props.project_id },
    ]);

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
          n_prior_exclusions={n_prior_exclusions}
          n_prior_inclusions={n_prior_inclusions}
          setLabel={setLabel}
          mobileScreen={props.mobileScreen}
        />
        <Divider />
        <LabeledRecord
          label={label}
          n_prior={n_prior}
          n_prior_exclusions={n_prior_exclusions}
          n_prior_inclusions={n_prior_inclusions}
          is_prior={true}
        />
        {((label === "relevant" && n_prior_inclusions === 0) ||
          (label === "irrelevant" && n_prior_exclusions === 0)) && (
          <Box className={classes.noPrior}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {`You have not labeled ${label} prior knowledge`}
            </Typography>
          </Box>
        )}
        {label === "all" && n_prior === 0 && (
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

export default connect(mapStateToProps)(PriorLabeled);

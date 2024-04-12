import * as React from "react";

import { Box, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { LabelChip, LabeledRecord } from "ProjectComponents/HistoryComponents";
import { ProjectContext } from "ProjectContext";
import { useContext } from "react";

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

const PriorLabeled = ({
  n_prior,
  n_prior_exclusions,
  n_prior_inclusions,
  mobileScreen,
}) => {
  const project_id = useContext(ProjectContext);

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
          n_prior_exclusions={n_prior_exclusions}
          n_prior_inclusions={n_prior_inclusions}
          setLabel={setLabel}
          mobileScreen={mobileScreen}
        />
        <Divider />
        <LabeledRecord
          project_id={project_id}
          label={label}
          n_prior={n_prior}
          n_prior_exclusions={n_prior_exclusions}
          n_prior_inclusions={n_prior_inclusions}
          is_prior={true}
        />
        <Box className={classes.noPrior}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No records labeled as {label !== "all" && label} prior knowledge
          </Typography>
        </Box>
      </Box>
    </Root>
  );
};

export default PriorLabeled;

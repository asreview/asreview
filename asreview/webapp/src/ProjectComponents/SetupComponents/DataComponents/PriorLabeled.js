import * as React from "react";
import { Box, Card, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { LabelChip, LabeledRecord } from "../../HistoryComponents";

const PREFIX = "PriorLabeled";

const classes = {
  noPrior: `${PREFIX}-no-prior`,
};

const Root = styled("div")(({ theme }) => ({
  width: "50%",
  [`& .${classes.noPrior}`]: {
    height: "calc(100% - 56px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function PriorLabeled(props) {
  const [label, setLabel] = React.useState("relevant");

  return (
    <Root>
      <Card
        elevation={0}
        square
        variant="outlined"
        sx={{
          height: "100%",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        }}
      >
        <LabelChip
          label={label}
          setLabel={setLabel}
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
      </Card>
    </Root>
  );
}

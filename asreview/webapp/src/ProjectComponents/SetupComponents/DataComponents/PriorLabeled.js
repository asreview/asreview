import * as React from "react";
import { Box, Card, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { LabelChip, LabeledRecord } from "../../HistoryComponents";

const PREFIX = "PriorLabeled";

const classes = {
  icon: `${PREFIX}-icon`,
  noPrior: `${PREFIX}-no-prior`,
};

const Root = styled("div")(({ theme }) => ({
  width: "50%",
  [`& .${classes.icon}`]: {
    color: theme.palette.text.secondary,
    [`:hover`]: {
      backgroundColor: "transparent",
    },
  },

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
        <LabelChip label={label} setLabel={setLabel} />
        <Divider />
        <LabeledRecord
          label={label}
          priorLabeled={true}
          n_prior={props.n_prior}
        />
        {props.n_prior === 0 && (
          <Box className={classes.noPrior}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You have not provided prior knowledge
            </Typography>
          </Box>
        )}
      </Card>
    </Root>
  );
}

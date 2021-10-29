import React, { useState } from "react";
import { connect } from "react-redux";
import { Box, Chip, Divider, Fade, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

import { Filter, LabeledRecord } from "../HistoryComponents";

import { mapStateToProps } from "../../globals.js";

const PREFIX = "HistoryPage";

const classes = {
  labelChip: `${PREFIX}-label-chip`,
};

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  overflowY: "hidden",
  [`& .${classes.labelChip}`]: {
    padding: "16px 24px 8px 24px",
  },
}));

const HistoryPage = (props) => {
  const [label, setLabel] = useState("relevant");

  const handleClickRelevant = () => {
    setLabel("relevant");
  };

  const handleClickIrrelevant = () => {
    setLabel("irrelevant");
  };

  return (
    <Root aria-label="history page">
      <Fade in>
        <Box>
          <Stack className={classes.labelChip} direction="row" spacing={2}>
            <Chip
              label="Relevant"
              color="primary"
              variant={label === "relevant" ? "filled" : "outlined"}
              onClick={handleClickRelevant}
            />
            <Chip
              label="Irrelevant"
              color="primary"
              variant={label === "irrelevant" ? "filled" : "outlined"}
              onClick={handleClickIrrelevant}
            />
          </Stack>
          <Divider />
          <Filter />
          <Divider />
        </Box>
      </Fade>
      <LabeledRecord label={label} />
    </Root>
  );
};

export default connect(mapStateToProps)(HistoryPage);

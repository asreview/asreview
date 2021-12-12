import React, { useState } from "react";
import { connect } from "react-redux";
import { Box, Divider, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { Filter, LabelChip, LabeledRecord } from "../HistoryComponents";

import { mapStateToProps } from "../../globals.js";

const filterOptions = [{ label: "Contains note", value: 0 }];

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  overflowY: "hidden",
}));

const HistoryPage = (props) => {
  const [label, setLabel] = useState("relevant");

  return (
    <Root aria-label="history page">
      <Fade in>
        <Box>
          <LabelChip label={label} setLabel={setLabel} />
          <Divider />
          <Filter filterOptions={filterOptions} />
          <Divider />
        </Box>
      </Fade>
      <LabeledRecord label={label} />
    </Root>
  );
};

export default connect(mapStateToProps)(HistoryPage);

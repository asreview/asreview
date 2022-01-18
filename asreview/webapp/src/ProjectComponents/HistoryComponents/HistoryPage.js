import React, { useState } from "react";
import { connect } from "react-redux";
import { Box, Divider, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PageHeader } from "../../Components";
import { Filter, LabelChip, LabeledRecord } from "../HistoryComponents";

import { mapStateToProps } from "../../globals.js";
import "../../App.css";

const filterOptions = [{ label: "Contains note", value: 0 }];

const Root = styled("div")(({ theme }) => ({}));

const HistoryPage = (props) => {
  const [label, setLabel] = useState("relevant");

  return (
    <Root aria-label="history page">
      <Fade in>
        <Box>
          <PageHeader
            header="Project history"
            mobileScreen={props.mobileScreen}
          />
          <Box
            className="main-page-sticky-header-wrapper"
            sx={{ background: (theme) => theme.palette.background.paper }}
          >
            <LabelChip label={label} setLabel={setLabel} />
            <Divider />
            <Filter filterOptions={filterOptions} />
            <Divider />
          </Box>
          <Box className="main-page-body-wrapper">
            <Box className="main-page-body">
              <LabeledRecord label={label} />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Root>
  );
};

export default connect(mapStateToProps)(HistoryPage);

import * as React from "react";
import { connect } from "react-redux";
import { Box, Divider, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PageHeader } from "../../Components";
import { Filter, LabelChip, LabeledRecord } from "../HistoryComponents";

import { mapStateToProps } from "../../globals.js";
import "../../App.css";

const filterOptions = [
  { value: "note", label: "Contains note" },
  { value: "prior", label: "Prior knowledge" },
];

const Root = styled("div")(({ theme }) => ({}));

const HistoryPage = (props) => {
  const [label, setLabel] = React.useState("relevant");
  const [filterQuery, setFilterQuery] = React.useState(null);

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
            <LabelChip
              mobileScreen={props.mobileScreen}
              label={label}
              setLabel={setLabel}
            />
            <Divider />
            <Filter
              mobileScreen={props.mobileScreen}
              filterOptions={filterOptions}
              setFilterQuery={setFilterQuery}
            />
            <Divider />
          </Box>
          <Box className="main-page-body-wrapper">
            <Box className="main-page-body">
              <LabeledRecord
                label={label}
                filterQuery={filterQuery}
                mobileScreen={props.mobileScreen}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Root>
  );
};

export default connect(mapStateToProps)(HistoryPage);

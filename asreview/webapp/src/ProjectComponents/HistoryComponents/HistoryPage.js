import * as React from "react";
import { Box, Divider, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PageHeader } from "../../Components";
import { Filter, LabelChip, LabeledRecord } from "../HistoryComponents";

const PREFIX = "HistoryPage";

const classes = {
  bodyMobile: `${PREFIX}-body-mobile`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.bodyMobile}`]: {
    [theme.breakpoints.down("md")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
}));

const HistoryPage = (props) => {
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
              label={props.label}
              setLabel={props.setLabel}
            />
            <Divider />
            <Filter
              mobileScreen={props.mobileScreen}
              filterQuery={props.filterQuery}
              setFilterQuery={props.setFilterQuery}
            />
            <Divider />
          </Box>
          <Box className="main-page-body-wrapper">
            <Box className={`${classes.bodyMobile} main-page-body`}>
              <LabeledRecord
                label={props.label}
                filterQuery={props.filterQuery}
                mobileScreen={props.mobileScreen}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Root>
  );
};

export default HistoryPage;

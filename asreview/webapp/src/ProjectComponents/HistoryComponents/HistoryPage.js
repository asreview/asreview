import * as React from "react";
import { Box, Divider, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PageHeader } from "Components";
import { Filter, LabelChip, LabeledRecord } from "../HistoryComponents";

const PREFIX = "HistoryPage";

const classes = {
  cardWrapper: `${PREFIX}-card-wrapper`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.cardWrapper}`]: {
    paddingTop: 32,
  },
}));

const HistoryPage = (props) => {
  return (
    <Root aria-label="history page">
      <Fade in>
        <Box>
          <PageHeader header="History" mobileScreen={props.mobileScreen} />
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
            <Box className={`${classes.cardWrapper} main-page-body`}>
              <LabeledRecord
                project_id={props.project_id}
                label={props.label}
                filterQuery={props.filterQuery}
                isSimulating={props.isSimulating}
                mobileScreen={props.mobileScreen}
                mode={props.mode}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Root>
  );
};

export default HistoryPage;

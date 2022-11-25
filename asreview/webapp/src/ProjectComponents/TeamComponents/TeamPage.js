import * as React from "react";
import { Box, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PageHeader } from "../../Components";
import InvitationContents from "./InvitationComponent";

const PREFIX = "TeamPage";

const classes = {
  cardWrapper: `${PREFIX}-card-wrapper`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.cardWrapper}`]: {
    paddingTop: 32,
    [theme.breakpoints.down("md")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
}));

const TeamPage = (props) => {
  return (
    <Root aria-label="history page">
      <Fade in>
        <Box>
          <PageHeader header="Team" mobileScreen={props.mobileScreen} />

          <Box className="main-page-body-wrapper">
            <InvitationContents />
          </Box>

        </Box>
      </Fade>
    </Root>
  );
};

export default TeamPage;

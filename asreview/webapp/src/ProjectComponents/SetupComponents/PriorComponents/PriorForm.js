import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PriorSelector } from "../DataComponents";

const PREFIX = "PriorForm";

const classes = {
  title: `${PREFIX}-title`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 24,
  },

  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
  },
}));

const PriorForm = ({
  setHistoryFilterQuery,
  mobileScreen,
  editable = true,
}) => {
  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Review criteria</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {/* {Description} */}
        </Typography>
      </Box>
      <Stack direction="column" spacing={3}>
        <PriorSelector
          setHistoryFilterQuery={setHistoryFilterQuery}
          editable={editable}
          mobileScreen={mobileScreen}
        />
      </Stack>
    </Root>
  );
};

export default PriorForm;

import * as React from "react";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const PREFIX = "DatasetInfo";

const classes = {
  cardOverlay: `${PREFIX}-cardOverlay`,
  singleLine: `${PREFIX}-singleLine`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.cardOverlay}`]: {
    height: "100%",
    width: "100%",
    left: 0,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 1,
  },

  [`& .${classes.singleLine}`]: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },
}));

const DatasetInfo = (props) => {
  return (
    <Root>
      <Card
        elevation={0}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        }}
      >
        <CardContent>
          <Box
            className={classes.cardOverlay}
            sx={{
              bgcolor: "transparent",
            }}
          />
          <Stack spacing={2}>
            <Stack>
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Dataset filename
              </Typography>
              <Typography variant="body2" className={classes.singleLine}>
                {props.info?.dataset_path}
              </Typography>
            </Stack>
            <Stack>
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Records
              </Typography>
              <Typography variant="body2" className={classes.singleLine}>
                {props.data?.n_rows}
              </Typography>
            </Stack>
            <Stack>
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Duplicates
              </Typography>
              <Typography variant="body2" className={classes.singleLine}>
                About {props.data?.n_duplicates}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Root>
  );
};

export default DatasetInfo;

import * as React from "react";
import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";

const PREFIX = "DataFormCard";

const classes = {
  cardContent: `${PREFIX}-card-content`,
  singleLine: `${PREFIX}-single-line`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.cardContent}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingRight: 8,
    position: "relative",
  },

  [`& .${classes.singleLine}`]: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 1,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },
}));

const DataFormCard = (props) => {
  return (
    <Root>
      <Card
        elevation={0}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "grey.900" : "grey.100",
        }}
      >
        <CardContent className={classes.cardContent}>
          <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
            <Box className={classes.singleLine}>
              <TypographySubtitle1Medium text={props.primary} />
            </Box>
            {!props.isError && (
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                {props.secondary}
              </Typography>
            )}
            {props.isError && (
              <Link component="button" underline="none" onClick={props.refetch}>
                Try to refresh
              </Link>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Root>
  );
};

export default DataFormCard;

import React from "react";
import NumberFormat from "react-number-format";
import { Box, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
// import { HelpOutline } from "@mui/icons-material";

const PREFIX = "NumberCard";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  icon: `${PREFIX}-icon`,
  number: `${PREFIX}-number`,
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  maxWidth: 960,
  width: "100%",
  [`& .${classes.root}`]: {
    alignItems: "center",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    padding: 16,
    WebkitBoxAlign: "center",
    ...(theme.palette.mode === "light" && {
      backgroundColor: "rgb(243, 244, 247)",
    }),
    ...(theme.palette.mode === "dark" && {
      backgroundColor: "rgb(30, 33, 42)",
    }),
  },

  [`& .${classes.content}`]: {
    textAlign: "center",
    margin: "auto",
  },

  [`& .${classes.icon}`]: {
    width: 56,
    height: 56,
    margin: "auto",
    marginBottom: 16,
    display: "flex",
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
    WebkitBoxAlign: "center",
    WebkitBoxPack: "center",
  },

  [`& .${classes.number}`]: {
    fontWeight: 700,
  },

  [`& .${classes.text}`]: {
    fontWeight: 600,
    opacity: 0.72,
    lineHeight: 2.46,
    textTransform: "uppercase",
  },
}));

export default function NumberCard(props) {
  const showNumber = () => {
    return (
      props.progressQuery &&
      !props.progressQuery.isError &&
      props.progressQuery.isFetched &&
      props.progressQuery.isSuccess
    );
  };

  return (
    <Root>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={4}>
          <Box className={classes.root}>
            <Typography className={classes.text} variant="subtitle1">
              Total Records
            </Typography>
            <Typography className={classes.number} variant="h6">
              <NumberFormat
                value={showNumber() ? props.progressQuery.data["n_papers"] : 0}
                displayType="text"
                thousandSeparator
              />
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Box className={classes.root}>
            <Typography className={classes.text} variant="subtitle1">
              Labeled
            </Typography>
            <Typography className={classes.number} variant="h6">
              <NumberFormat
                value={
                  showNumber()
                    ? props.progressQuery.data["n_included"] +
                      props.progressQuery.data["n_excluded"]
                    : 0
                }
                displayType="text"
                thousandSeparator
              />
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Box className={classes.root}>
            <Typography className={classes.text} variant="subtitle1">
              Relevant
            </Typography>
            <Typography className={classes.number} variant="h6">
              <NumberFormat
                value={
                  showNumber() ? props.progressQuery.data["n_included"] : 0
                }
                displayType="text"
                thousandSeparator
              />
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Root>
  );
}

import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowBack } from "@mui/icons-material";

import { InlineErrorHandler } from "../../../Components";
import { PriorUnlabeled } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";
import { useToggle } from "../../../hooks/useToggle";

const PREFIX = "PriorRandom";

const classes = {
  recordCard: `${PREFIX}-record-card`,
  icon: `${PREFIX}-icon`,
  empty: `${PREFIX}-empty`,
  loading: `${PREFIX}-loading`,
  reminder: `${PREFIX}-reminder`,
};

const Root = styled("div")(({ theme }) => ({
  width: "50%",
  [`& .${classes.recordCard}`]: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 208px)",
    width: "100%",
    overflowY: "scroll",
    padding: "16px 24px",
  },
  [`& .${classes.icon}`]: {
    color: theme.palette.text.secondary,
    [`:hover`]: {
      backgroundColor: "transparent",
    },
  },

  [`& .${classes.empty}`]: {
    height: "calc(100% - 56px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.loading}`]: {
    height: "calc(100% - 56px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.reminder}`]: {
    borderRadius: 16,
    margin: "32px 24px",
    maxWidth: 960,
  },
}));

const PriorRandom = (props) => {
  const queryClient = useQueryClient();
  const [reminder, toggleReminder] = useToggle();

  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
    ["fetchPriorRandom", { project_id: props.project_id }],
    ProjectAPI.fetchPriorRandom,
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  const refetchPriorRandom = () => {
    queryClient.resetQueries("fetchPriorRandom");
  };

  const onClickPriorSearch = () => {
    props.toggleSearch();
    props.toggleRandom();
  };

  React.useEffect(() => {
    if (props.n_prior_exclusions !== 0 && props.n_prior_exclusions % 5 === 0) {
      toggleReminder();
    }
  }, [props.n_prior_exclusions, toggleReminder]);

  return (
    <Root>
      <Fade in>
        <Card
          elevation={0}
          square
          variant="outlined"
          sx={{ height: "100%", bgcolor: "transparent" }}
        >
          <Stack direction="row" sx={{ p: "4px 16px" }}>
            <Tooltip title="Select another way">
              <IconButton className={classes.icon} onClick={props.toggleRandom}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
          </Stack>
          <Divider />
          {isFetching && !isError && (
            <Box className={classes.loading}>
              <CircularProgress />
            </Box>
          )}
          {!isFetching && isError && (
            <Box className={classes.empty}>
              <InlineErrorHandler
                message={error["message"]}
                refetch={refetchPriorRandom}
                button={true}
              />
            </Box>
          )}
          {!reminder && !isError && isFetched && isSuccess && (
            <Box
              className={classes.recordCard}
              aria-label="unlabeled record card"
            >
              {data?.result.map((record, index) => (
                <PriorUnlabeled
                  project_id={props.project_id}
                  record={record}
                  n_prior={props.n_prior}
                  key={`result-page-${index}`}
                />
              ))}
            </Box>
          )}
          {reminder && (
            <Card elevation={3} className={classes.reminder}>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  Enough irrelevant records found
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {props.n_prior_exclusions} records were labeled as irrelevant.
                  You have found enough irrelevant records as prior knowledge.
                  Try to search for relevant records?
                </Typography>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button size="small" onClick={toggleReminder}>
                  Show More Random
                </Button>
                <Button size="small" onClick={onClickPriorSearch}>
                  Search
                </Button>
              </CardActions>
            </Card>
          )}
        </Card>
      </Fade>
    </Root>
  );
};

export default PriorRandom;

import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowBack } from "@mui/icons-material";

import { InlineErrorHandler } from "../../../Components";
import { PriorUnlabeled } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps } from "../../../globals.js";
import { useToggle } from "../../../hooks/useToggle";

const PREFIX = "PriorSearch";

const classes = {
  recordCard: `${PREFIX}-record-card`,
  icon: `${PREFIX}-icon`,
  empty: `${PREFIX}-empty`,
  loading: `${PREFIX}-loading`,
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
}));

const PriorSearch = (props) => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = React.useState("");
  const [clickSearch, onClickSearch] = useToggle();

  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
    ["fetchPriorSearch", { project_id: props.project_id, keyword: keyword }],
    ProjectAPI.fetchPriorSearch,
    {
      enabled: clickSearch,
      onSuccess: () => {
        if (clickSearch) {
          onClickSearch();
        }
      },
      refetchOnWindowFocus: false,
    }
  );

  const refetchPriorSearch = () => {
    queryClient.resetQueries("fetchPriorSearch");
  };

  const onChangeKeyword = (event) => {
    setKeyword(event.target.value);
  };

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
              <IconButton className={classes.icon} onClick={props.toggleSearch}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <InputBase
              autoFocus
              fullWidth
              onChange={onChangeKeyword}
              placeholder="Keyword in title, abstract, or author"
              sx={{ ml: 1 }}
            />
            <Button onClick={onClickSearch}>Search</Button>
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
                refetch={refetchPriorSearch}
                button={true}
              />
            </Box>
          )}
          {!isFetching && !isError && data === undefined && (
            <Box className={classes.empty}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Your search results will show up here
              </Typography>
            </Box>
          )}
          {!isFetching &&
            !isError &&
            !data?.result.filter((record) => record?.included === -1)
              .length && (
              <Box className={classes.empty}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Your search results will show up here
                </Typography>
              </Box>
            )}
          {!isError && isFetched && isSuccess && (
            <Box
              className={classes.recordCard}
              aria-label="unlabeled record card"
            >
              {data?.result
                .filter((record) => record?.included === -1)
                .map((record, index) => (
                  <PriorUnlabeled
                    keyword={keyword}
                    record={record}
                    n_prior={props.n_prior}
                    key={`result-page-${index}`}
                  />
                ))}
            </Box>
          )}
        </Card>
      </Fade>
    </Root>
  );
};

export default connect(mapStateToProps)(PriorSearch);

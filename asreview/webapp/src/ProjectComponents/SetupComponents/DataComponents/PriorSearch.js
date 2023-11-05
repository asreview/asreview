import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  CircularProgress,
  Divider,
  Fade,
  InputBase,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowBack, Search } from "@mui/icons-material";

import { InfoCard } from "../../SetupComponents";
import { InlineErrorHandler } from "../../../Components";
import { PriorUnlabeled } from "../DataComponents";
import { StyledIconButton } from "../../../StyledComponents/StyledButton";
import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps } from "../../../globals.js";
import { useToggle } from "../../../hooks/useToggle";

const PREFIX = "PriorSearch";

const classes = {
  root: `${PREFIX}-root`,
  recordCard: `${PREFIX}-record-card`,
  infoCard: `${PREFIX}-info-card`,
  empty: `${PREFIX}-empty`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  [`& .${classes.root}`]: {
    height: "100%",
  },

  [`& .${classes.recordCard}`]: {
    alignItems: "center",
    height: "calc(100vh - 208px)",
    width: "100%",
    overflowY: "scroll",
    padding: "32px 24px",
    [theme.breakpoints.down("md")]: {
      height: "calc(100% - 56px)",
    },
  },

  [`& .${classes.infoCard}`]: {
    width: "100%",
    maxWidth: "400px",
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
    },
  );

  const refetchPriorSearch = () => {
    queryClient.resetQueries("fetchPriorSearch");
  };

  const onChangeKeyword = (event) => {
    setKeyword(event.target.value);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      onClickSearch();
    }
  };

  return (
    <Root>
      <Fade in>
        <Box className={classes.root}>
          <Stack direction="row" sx={{ p: "4px 16px" }}>
            <Tooltip title="Select another way">
              <StyledIconButton onClick={props.toggleSearch}>
                <ArrowBack />
              </StyledIconButton>
            </Tooltip>
            <InputBase
              id="search-input"
              autoFocus
              fullWidth
              onChange={onChangeKeyword}
              onKeyDown={onKeyDown}
              placeholder="Search"
              sx={{ ml: 1 }}
            />
            <StyledIconButton
              id="search"
              onClick={onClickSearch}
            >
              <Search />
            </StyledIconButton>
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
          {!isFetching &&
            !isError &&
            (data === undefined ||
              !data?.result.filter((record) => record?.included === -1)
                .length) && (
              <Box className={classes.empty}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Your search results will show up here
                </Typography>
              </Box>
            )}
          {!isError && isFetched && isSuccess && (
            <Stack
              className={classes.recordCard}
              aria-label="unlabeled record card"
              spacing={3}
            >
              <Box className={classes.infoCard}>
                <InfoCard info="Label records that you want to use as prior knowledge" />
              </Box>
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
            </Stack>
          )}
        </Box>
      </Fade>
    </Root>
  );
};

export default connect(mapStateToProps)(PriorSearch);

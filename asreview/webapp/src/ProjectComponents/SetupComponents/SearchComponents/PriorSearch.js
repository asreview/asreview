import { Search } from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";

import { InlineErrorHandler } from "Components";
import { RecordCard } from "ProjectComponents/ReviewComponents";
import { StyledIconButton } from "StyledComponents/StyledButton";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";

import { ProjectContext } from "ProjectContext";
import { useContext } from "react";

const PREFIX = "PriorSearch";

const classes = {
  root: `${PREFIX}-root`,
  recordCard: `${PREFIX}-record-card`,
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

const PriorSearch = ({}) => {
  const project_id = useContext(ProjectContext);

  const queryClient = useQueryClient();
  const [keyword, setKeyword] = React.useState("");
  const [clickSearch, onClickSearch] = useToggle();

  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
    ["fetchPriorSearch", { project_id: project_id, keyword: keyword }],
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

  const afterDecision = () => {
    console.log("afterDecision - close the card");
  };

  return (
    <Root>
      <Fade in>
        <Box className={classes.root}>
          <Stack direction="row" sx={{ p: "4px 16px" }}>
            <InputBase
              id="search-input"
              autoFocus
              fullWidth
              onChange={onChangeKeyword}
              onKeyDown={onKeyDown}
              placeholder="Search"
              sx={{ ml: 1 }}
            />
            <StyledIconButton id="search" onClick={onClickSearch}>
              <Search />
            </StyledIconButton>
          </Stack>
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
                <Typography
                  id="no-search-result"
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
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
              <Alert severity="info">
                Label records that you want to use as prior knowledge
              </Alert>
              {data?.result
                .filter((record) => record?.included === -1)
                .map((record, index) => (
                  <RecordCard
                    project_id={project_id}
                    record={record}
                    afterDecision={afterDecision}
                    collapseAbstract={true}
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

export default PriorSearch;

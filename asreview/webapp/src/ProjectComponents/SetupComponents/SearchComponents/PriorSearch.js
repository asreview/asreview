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
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";

import { RecordCard } from "ProjectComponents/ReviewComponents";
import { StyledIconButton } from "StyledComponents/StyledButton";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";

import { ProjectContext } from "ProjectContext";
import { useContext } from "react";

const PriorSearch = () => {
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

  return (
    <Fade in>
      <Box>
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
          <Box>
            <CircularProgress />
          </Box>
        )}
        {!isFetching && isError && (
          <Box>
            <Alert severity="error">{error["message"]}</Alert>
          </Box>
        )}
        {!isFetching &&
          !isError &&
          (data === undefined ||
            !data?.result.filter((record) => record?.included === -1)
              .length) && (
            <Typography
              id="no-search-result"
              variant="body2"
              sx={{ color: "text.secondary" }}
            >
              Your search results will show up here
            </Typography>
          )}
        {!isError && isFetched && isSuccess && (
          <Stack aria-label="unlabeled record card" spacing={3}>
            <Alert severity="info">
              Label records that you want to use as prior knowledge
            </Alert>
            {data?.result.map((record, index) => (
              <RecordCard
                project_id={project_id}
                record={record}
                collapseAbstract={true}
                retrainAfterDecision={false}
                transitionType="collapse"
                showNotes={false}
                key={`result-record-${index}`}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Fade>
  );
};

export default PriorSearch;

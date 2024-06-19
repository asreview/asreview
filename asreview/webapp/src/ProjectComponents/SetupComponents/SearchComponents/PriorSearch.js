import { Search } from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  InputBase,
  Paper,
  Stack,
} from "@mui/material";
import * as React from "react";
import { useQuery } from "react-query";

import { RecordCard } from "ProjectComponents/ReviewComponents";
import { StyledIconButton } from "StyledComponents/StyledButton";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";

import { ProjectContext } from "ProjectContext";
import { useContext } from "react";

const PriorSearch = () => {
  const project_id = useContext(ProjectContext);

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
        <Paper
          // component="form"
          sx={{ p: 1, display: "flex", alignItems: "center" }}
        >
          <InputBase
            id="search-input"
            autoFocus
            fullWidth
            onChange={onChangeKeyword}
            onKeyDown={onKeyDown}
            placeholder="Search for records in the dataset"
            sx={{ ml: 1, flex: 1 }}
          />
          <StyledIconButton id="search" onClick={onClickSearch}>
            <Search />
          </StyledIconButton>
        </Paper>
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
        {!isError && isFetched && isSuccess && (
          <Stack aria-label="unlabeled record card" spacing={3}>
            <Alert severity="success" sx={{ mt: 2 }}>
              Tip: Label only the record you are looking for!
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

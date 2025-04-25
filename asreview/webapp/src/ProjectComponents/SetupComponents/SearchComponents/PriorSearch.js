import { Search } from "@mui/icons-material";
import { Alert, CircularProgress, Fade, Stack } from "@mui/material";
import * as React from "react";
import { useQuery } from "react-query";

import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";
import { RecordCard } from "ProjectComponents/ReviewComponents";

import { ProjectContext } from "context/ProjectContext";
import { useContext } from "react";
import { StyledInputSearch } from "StyledComponents/StyledInputSearch";

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

  return (
    <Fade in>
      <Stack spacing={3}>
        <StyledInputSearch
          autoFocus
          endIcon={<Search />}
          value={keyword}
          disabled={isFetching}
          onClick={onClickSearch}
          onChange={(event) => {
            setKeyword(event.target.value);
          }}
          placeholder="Search for records in the dataset"
        />

        {isFetching && !isError && <CircularProgress />}
        {!isFetching && isError && (
          <Alert severity="error">{error["message"]}</Alert>
        )}
        {!isError && isFetched && isSuccess && (
          <>
            <Alert severity="success" sx={{ mt: 2 }}>
              Tip: Only label the record(s) that match your search
            </Alert>
            {data?.result.map((record, index) => (
              <RecordCard
                project_id={project_id}
                record={record}
                collapseAbstract={true}
                retrainAfterDecision={false}
                transitionType="collapse"
                transitionSpeed={{ enter: 500, exit: 800 }}
                showNotes={false}
                key={`result-record-${index}`}
              />
            ))}
          </>
        )}
      </Stack>
    </Fade>
  );
};

export default PriorSearch;

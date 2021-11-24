import React, { useState, useEffect, useRef } from "react";
import { CircularProgress, Typography, List } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ListItemPaper } from "../PreReviewComponents";
import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";

const PREFIX = "SearchResultDialog";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    margin: "auto",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
}));

const SearchResultDialog = (props) => {
  const [searchResult, setSearchResult] = useState(null);

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const descriptionElementRef = useRef(null);
  useEffect(() => {
    if (true) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }

    const searchRequest = (searchQuery) => {
      ProjectAPI.search(props.project_id, searchQuery)
        .then((result) => {
          setSearchResult(result.data["result"]);
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    };
    // make search request
    searchRequest(props.searchQuery);
  }, [props.searchQuery, props.project_id, error.message]);

  return (
    <Root>
      <Typography>Search result: {props.searchQuery}</Typography>
      {error.message !== null && (
        <div className={classes.root}>
          <ErrorHandler error={error} setError={setError} />
        </div>
      )}
      {error.message === null && searchResult === null && (
        <div className={classes.root}>
          <CircularProgress />
        </div>
      )}
      {error.message === null && searchResult !== null && (
        <List dense={true}>
          {searchResult.map((value, index) => {
            return (
              <ListItemPaper
                id={value.id}
                title={value.title}
                authors={value.authors}
                abstract={value.abstract}
                included={value.included}
                onRevertInclude={props.onRevertInclude}
                includeItem={props.includeItem}
                excludeItem={props.excludeItem}
                resetItem={props.resetItem}
                closeSearchResult={props.closeSearchResult}
                // this component needs a key as well
                key={`container-result-item-${value.id}`}
              />
            );
          })}
        </List>
      )}
    </Root>
  );
};

export default SearchResultDialog;

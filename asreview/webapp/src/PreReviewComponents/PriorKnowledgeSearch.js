import React from "react";
import {
  Box,
  Typography,
  FormControl,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

import { SearchResult } from "../PreReviewComponents";

const PREFIX = "PriorKnowledgeSearch";

const classes = {
  paperRoot: `${PREFIX}-paperRoot`,
  inputSearch: `${PREFIX}-inputSearch`,
  button: `${PREFIX}-button`,
  root: `${PREFIX}-root`,
  input: `${PREFIX}-input`,
  iconButton: `${PREFIX}-iconButton`,
  divider: `${PREFIX}-divider`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.paperRoot}`]: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    marginBottom: "32px",
    minHeight: "200px",
  },

  [`&.${classes.inputSearch}`]: {
    margin: "20px 0px 0px 0px",
  },

  [`& .${classes.button}`]: {
    margin: "36px 0px 24px 12px",
    float: "right",
  },

  [`& .${classes.root}`]: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "12px 0px 36px 0px",
  },

  [`& .${classes.input}`]: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },

  [`& .${classes.iconButton}`]: {
    padding: 10,
  },

  [`& .${classes.divider}`]: {
    height: 28,
    margin: 4,
  },
}));

const PriorKnowledgeSearch = (props) => {
  const [searchDialog, setSearchDialog] = React.useState({
    open: false,
    query: "",
  });

  const closeSearchResult = () => {
    setSearchDialog({
      ...searchDialog,
      open: false,
    });
  };

  const onChangeSearch = (evt) => {
    setSearchDialog({
      open: false,
      query: evt.target.value,
    });
  };

  const showSearchResult = (evt) => {
    evt.preventDefault();

    setSearchDialog({
      open: true,
      query: searchDialog.query,
    });
  };

  return (
    <StyledBox style={{ clear: "both" }} className={classes.inputSearch}>
      <Typography>Search for a document to use as prior knowledge.</Typography>
      <form
        className={classes.root}
        noValidate
        autoComplete="off"
        onSubmit={showSearchResult}
      >
        <FormControl fullWidth variant="outlined">
          <OutlinedInput
            id="prior-search-input-included"
            placeholder="Search on keyword, author or title"
            value={searchDialog.query}
            onChange={onChangeSearch}
            autoFocus
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="search for papers"
                  type="submit"
                  size="large"
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </form>

      {searchDialog.open && searchDialog.query !== "" && (
        <SearchResult
          project_id={props.project_id}
          searchQuery={searchDialog.query}
          updatePriorStats={props.updatePriorStats}
          onRevertInclude={props.removeIncluded}
          includeItem={props.includeItem}
          excludeItem={props.excludeItem}
          resetItem={props.resetItem}
          closeSearchResult={closeSearchResult}
        />
      )}
    </StyledBox>
  );
};

export default PriorKnowledgeSearch;

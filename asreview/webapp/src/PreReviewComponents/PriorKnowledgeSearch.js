import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Typography,
  FormControl,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@material-ui/core'

import SearchIcon from '@material-ui/icons/Search';

import {
  SearchResult,
} from '../PreReviewComponents'

import axios from 'axios'

import { api_url } from '../globals.js';

const useStyles = makeStyles(theme => ({
  paperRoot: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    marginBottom: "32px",
    minHeight: "200px",
  },
  inputSearch: {
    margin: '20px 0px 0px 0px',
  },
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 0px 36px 0px',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },

}));


const PriorKnowledgeSearch = (props) => {
  const classes = useStyles();

  const [searchDialog, setSearchDialog] = React.useState({
    open : false,
    query : ""
  });

  const onChangeSearch = (evt) => {
    setSearchDialog({
      open : false,
      query : evt.target.value
    })
  }

  const showSearchResult = (evt) => {
    evt.preventDefault();

    setSearchDialog({
      open : true,
      query : searchDialog.query
    });
  }

  return (
    <Box
      style={{clear: "both"}}
      className={classes.inputSearch}
    >
      <Typography>
        Search for an publication of interest.
      </Typography>
      <form
        className={classes.root}
        noValidate
        autoComplete="off"
        onSubmit={showSearchResult}
      >
        <FormControl
          fullWidth
          variant="outlined"
        >
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
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </form>

      {(searchDialog.open && searchDialog.query !== "") &&
        <SearchResult
          project_id={props.project_id}
          searchQuery={searchDialog.query}
          updatePriorStats={props.updatePriorStats}
          onRevertInclude={props.removeIncluded}
          includeItem={props.includeItem}
          excludeItem={props.excludeItem}
          resetItem={props.resetItem}
        />
      }

    </Box>
  )
}

export default PriorKnowledgeSearch;

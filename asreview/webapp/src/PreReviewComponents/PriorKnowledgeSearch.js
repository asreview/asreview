import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  Typography,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Toolbar,
  IconButton,
  Paper,
} from '@material-ui/core'

import SearchIcon from '@material-ui/icons/Search';

import {
  SearchResult,
  PaperCard,
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
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  margin: {
    marginTop: 20
  },
  root: {
    padding: '2px 4px',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
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


const labelPriorItem = (project_id, doc_id, label, callbk=null) => {
  const url = api_url + `project/${project_id}/labelitem`;

  let body = new FormData();
  body.set('doc_id', doc_id);
  body.set('label', label);
  body.set('is_prior', 1);

  axios.post(
    url,
    body,
    {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      }
    })
  .then((result) => {
    if (callbk !== null){
      callbk();
    }
  })
  .catch((error) => {
    console.log(error);
  });

}


const PriorKnowledgeSearch = (props) => {
  const classes = useStyles();

  const [included, setIncluded] = React.useState([])

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

  // const addIncluded = (item) => {
  //   console.log('Add item to included: ' + item['id'])
  //   // setIncluded([item].concat(included))
  //   // console.log(included)
  // }

  const removeIncluded = (item) => {
    console.log('Remove item to included: ' + item['id'])
  }


  return (
    <Box style={{clear: "both"}}>
      <form className={classes.root} noValidate autoComplete="off" onSubmit={showSearchResult}>
        <FormControl
          fullWidth
          className={classes.margin}
          variant="outlined"
        >
          <OutlinedInput
            id="prior-search-input-included"
            placeholder="Search on keyword, author or title"
            value={searchDialog.query}
            onChange={onChangeSearch}
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
          resetItem={props.resetItem}
        />
      }

    </Box>
  )
}

export default PriorKnowledgeSearch;

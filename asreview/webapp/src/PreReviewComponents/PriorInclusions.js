import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  Typography,
  FormControl,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
  Toolbar,
  IconButton,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';

import {
  SearchResult,
  SearchResultDialog,
  PaperCard,
} from '../PreReviewComponents'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  margin: {
    marginTop: 20
  },
  helpertext: {
    color: "#FF0000"
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

const mapStateToProps = state => {
  return { project_id: state.project_id };
};


const PriorInclusions = (props) => {
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

  const openSearchDialog = (evt) => {
    evt.preventDefault();

    setSearchDialog({
      open : true,
      query : searchDialog.query
    });
 
  }

  const closeSearchDialog = () => {
    setSearchDialog({
      open : false,
      query : ""
    });

    // refresh the prior inclusions
    getPriorIncluded();
  }

  const getPriorIncluded = () => {

    const url = api_url + `project/${props.project_id}/get_prior`;

    axios.get(url)
    .then((result) => {
      console.log(result.data['result']);
      setIncluded(result.data['result']);
    })
    .catch((error) => {
      console.log(error);
    });

  }

  const addIncluded = (item) => {
    console.log('Add item to included: ' + item['id'])
    // setIncluded([item].concat(included))
    // console.log(included)
  }

  const removeIncluded = (item) => {
    console.log('Remove item to included: ' + item['id'])
  }

  const removeIncluded2 = (item) => {
    console.log('Remove item to included: ' + item['id'])

    // refresh the prior inclusions
    getPriorIncluded();
  }

  return (
    <Box>
      <Typography variant="h5">
        Do you have publications to include?
      </Typography>
      <Box>
      <form className={classes.root} noValidate autoComplete="off" onSubmit={openSearchDialog}>
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

      {included.length > 0 && 
        <Box>
          <Typography>The following publications have been included:</Typography>

          {included.map((value, index) => {

            return (
                <PaperCard
                  id={value.id}
                  title={value.title}
                  abstract={value.abstract}
                  included={value.included}

                  onInclude={addIncluded}
                  onRevertInclude={removeIncluded2}
                  removeResultOnRevert={true}
                  removeButton={true}

                  onNonSelectLabel={null}
                  collapseAbstract={true}

                  // this component needs a key as well
                  key={`container-result-item-${value.id}`}
                />
            );
          })}

        </Box>
      }

      {(searchDialog.open && searchDialog.query !== "") && 
        <SearchResultDialog
          searchQuery={searchDialog.query}
          closeSearchDialog={closeSearchDialog}
          onRevertInclude={removeIncluded}
          onInclude={addIncluded}
        />
      }
      </Box>
      <Toolbar className={classes.clear}/>

      <Button
        variant="contained"
        color="primary"
        onClick={props.handleNext}
        className={classes.button}
      >
        Next
      </Button>

    </Box>
  )
}

export default connect(mapStateToProps)(PriorInclusions);

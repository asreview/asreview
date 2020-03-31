import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';

import {
  SearchResult
} from '../PreReviewComponents'

import axios from 'axios'
import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    margin: 'auto',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};


const SearchResultDialog = (props) => {

  const classes = useStyles();

  const [searchResult, setSearchResult] = React.useState(null);

  const searchRequest = (searchQuery) => {

      const url = api_url + `project/${props.project_id}/search`;

      axios.get(
        url,
        {params: 
          {q: searchQuery,
           n_max: 10}})
      .then((result) => {
          setSearchResult(
            result.data['result']
          );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (true) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }

    // make search request
    searchRequest(props.searchQuery)

  }, [true]);

  return (
    <div>
      <Dialog
        open={true}
        onClose={props.closeSearchDialog}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Search result: {props.searchQuery}</DialogTitle>
        <DialogContent dividers={true}>
          {searchResult === null && 
          <div className={classes.root}>
            <CircularProgress/>
          </div>
          }
          {searchResult !== null && 
            <SearchResult searchResult={searchResult}
              onRevertInclude={props.onRevertInclude}
              removeResultOnRevert={false}

            />}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.closeSearchDialog} color="primary">
            Return
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default connect(mapStateToProps)(SearchResultDialog);

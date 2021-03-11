import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  Typography,
  List,
} from '@material-ui/core';

import {
  ListItemPaper,
} from '../PreReviewComponents'
import ErrorHandler from '../ErrorHandler';

import axios from 'axios'
import { api_url } from '../globals.js';

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

const SearchResultDialog = (props) => {

  const classes = useStyles();

  const [searchResult, setSearchResult] = useState(null);

  const [error, setError] = useState({
    "message": null,
    "retry": false,
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
          if (error.response) {
            setError({
              'message': error.response.data.message,
              'retry': true,
            });
            console.log(error.response);
          } else {
            setError({
              'message': "Failed to connect to server. Please restart the software.",
              'retry': false,
            });
          };
        });
    }
    // make search request
    searchRequest(props.searchQuery)

  }, [props.searchQuery, props.project_id, error.message]);

  return (
    <div>
      <Typography>Search result: {props.searchQuery}</Typography>
        {error.message !== null &&
          <div className={classes.root}>
            <ErrorHandler
              error={error}
              setError={setError}
            />
          </div>
        }
        {error.message === null && searchResult === null &&
          <div className={classes.root}>
            <CircularProgress/>
          </div>
        }
        {error.message === null && searchResult !== null &&
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
                  updatePriorStats={props.updatePriorStats}
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
        }
    </div>
  );
}

export default SearchResultDialog;

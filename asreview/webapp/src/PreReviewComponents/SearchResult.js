import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  CircularProgress,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
} from '@material-ui/core';

import {
  ListItemPaper,
} from '../PreReviewComponents'

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

  const [searchResult, setSearchResult] = React.useState(null);


  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
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
          console.log(error);
        });
    }
    // make search request
    searchRequest(props.searchQuery)

  }, [props.searchQuery, props.project_id]);

  return (
    <div>
        <Typography>Search result: {props.searchQuery}</Typography>
          {searchResult === null &&
          <div className={classes.root}>
            <CircularProgress/>
          </div>
          }
          {searchResult !== null &&
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
                    resetItem={props.resetItem}

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

import React from 'react'
import {
  List,
} from '@material-ui/core'

import {
  ListItemPaper
} from '../PreReviewComponents'

const SearchResult = (props) => {

  return (
    <List dense={true}>

      {props.searchResult.map((value, index) => {

        return (
            <ListItemPaper
              id={value.id}
              title={value.title}
              authors={value.authors}
              included={value.included}
              onRevertInclude={props.onRevertInclude}
              removeResultOnRevert={props.removeResultOnRevert}

              // this component needs a key as well
              key={`container-result-item-${value.id}`}
            />
        );
      })}

  </List>
  )
}

export default SearchResult;
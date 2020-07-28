import React from 'react';
import {
  Box,
  Typography,
} from '@material-ui/core';

const PaperCard = (props) => {

  return (
    <Box>
      <Typography variant="h6">
        {props.title}
      </Typography>

      {(props.abstract === "" || props.abstract === null) &&
        <Box fontStyle="italic">
          This article doesn't have an abstract.
        </Box>
      }

      {!(props.abstract === "" || props.abstract === null) &&
        <Typography>
          {props.abstract}
        </Typography>
      }
    </Box>
  );
}

export default PaperCard;

import React from "react";
import { Box, Typography } from "@mui/material";

const PaperCard = (props) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {props.title}
      </Typography>

      {(props.abstract === "" || props.abstract === null) && (
        <Box fontStyle="italic">
          <Typography gutterBottom>
            This document doesn't have an abstract.
          </Typography>
        </Box>
      )}

      {!(props.abstract === "" || props.abstract === null) && (
        <Typography>{props.abstract}</Typography>
      )}
    </Box>
  );
};

export default PaperCard;

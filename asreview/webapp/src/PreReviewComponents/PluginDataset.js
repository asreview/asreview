import React, { useState } from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const PREFIX = "PluginDataset";

const classes = {
  cardRoot: `${PREFIX}-cardRoot`,
  media: `${PREFIX}-media`,
};

const StyledCard = styled(Card)(({ theme }) => ({
  [`&.${classes.cardRoot}`]: {
    width: 360,
    height: 250,
    display: "inline-block",
    margin: theme.spacing(2),
  },

  [`& .${classes.media}`]: {
    height: 140,
    backgroundColor: "#A3A3A3",
  },
}));

const PluginDataset = (props) => {
  const [state, setState] = useState(false);

  const uploadDataset = () => {
    // upload state
    setState(true);

    // send upload request to server
    props.onUploadHandler(props.dataset_id, resetState);
  };

  const resetState = () => {
    // setState(false);
  };

  function DataSetCard(dataset) {
    return (
      <StyledCard
        className={classes.cardRoot}
        key={dataset.dataset_id}
        onClick={!state ? uploadDataset : undefined}
      >
        {!state ? (
          <CardActionArea>
            <CardMedia
              className={classes.media}
              image={dataset.img_url}
              title={dataset.title}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {dataset.title}
              </Typography>
              <Typography
                noWrap
                variant="body2"
                color="textSecondary"
                component="p"
              >
                {dataset.description}
              </Typography>
            </CardContent>
          </CardActionArea>
        ) : (
          <div>
            <CardMedia
              className={classes.media}
              image={dataset.img_url}
              title={dataset.title}
            />
            <CardContent>
              <CircularProgress />
            </CardContent>
          </div>
        )}
      </StyledCard>
    );
  }

  if (props.dataset.constructor === Array) {
    return DataSetCard(props.dataset[props.dataset.length - 1]);
  } else {
    return DataSetCard(props.dataset);
  }
};

export default PluginDataset;

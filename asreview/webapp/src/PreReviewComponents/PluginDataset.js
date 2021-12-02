import React, { useState } from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    width: 360,
    height: 250,
    display: "inline-block",
    margin: theme.spacing(2),
  },
  media: {
    height: 140,
    backgroundColor: "#A3A3A3",
  },
}));

const PluginDataset = (props) => {
  const classes = useStyles();

  const [state, setState] = useState(false);

  const uploadDataset = (dataset_id) => {
    // upload state
    setState(true);

    // send upload request to server
    props.onUploadHandler(dataset_id, resetState);
  };

  const resetState = () => {
    // setState(false);
  };

  function DataSetCard(dataset) {
    return (
      <Card className={classes.cardRoot} key={dataset.dataset_id}>
        {!state ? (
          <CardActionArea onClick={() => uploadDataset(dataset.dataset_id)}>
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
      </Card>
    );
  }

  if (props.dataset.constructor === Array) {
    return DataSetCard(props.dataset[props.dataset.length - 1]);
  } else {
    return DataSetCard(props.dataset);
  }
};

export default PluginDataset;

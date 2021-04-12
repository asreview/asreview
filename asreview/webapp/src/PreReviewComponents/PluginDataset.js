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

  const uploadDataset = () => {
    // upload state
    setState(true);

    // send upload request to server
    props.onUploadHandler(props.dataset_id, resetState);
  };

  const resetState = () => {
    // setState(false);
  };

  return (
    <Card
      className={classes.cardRoot}
      key={props.dataset_id}
      onClick={!state ? uploadDataset : undefined}
    >
      {!state ? (
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={props.img_url}
            title={props.title}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {props.title}
            </Typography>
            <Typography
              noWrap
              variant="body2"
              color="textSecondary"
              component="p"
            >
              {props.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      ) : (
        <div>
          <CardMedia
            className={classes.media}
            image={props.img_url}
            title={props.title}
          />
          <CardContent>
            <CircularProgress />
          </CardContent>
        </div>
      )}
    </Card>
  );
};

export default PluginDataset;

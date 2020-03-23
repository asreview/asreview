import React, {useState, useEffect} from 'react';
import {
  Container,
  Grid,
  Tooltip,
  Fab,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

import { api_url } from '../globals.js';

import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: '24px',
  },
  absolute: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },
  cardRoot: {
    width: 400,
    display: "inline-block",
    margin: theme.spacing(2),
    // align: "center",
  },
  cards: {
    marginBottom: "20px",
    textAlign: "center",
    margin: 0,
  },  
  media: {
    height: 140,
  },
}));


const ProjectDemoData = (props) => {

    const classes = useStyles();

    const [datasets, setDatasets] = useState([]);

    useEffect(() => {

      const fetchData = async () => {

        const url = api_url + "demo_data";

        const result = await axios.get(url)
          .then((result) => {
            setDatasets(result.data['result']);
          })
          .catch((error) => {
            console.log(error);
          });
      };
      fetchData();

    }, []);


    return (

      <div className={classes.cards}>
        {datasets.map(dataset => (
          <Card
            className={classes.cardRoot}
            key={dataset.name}
            onClick={() => {props.onUploadHandler(dataset.name)}}
          >
            <CardActionArea>
              <CardMedia
                className={classes.media}
                image={props.image_url}
                title={dataset.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {dataset.description}
                </Typography>
                <Typography noWrap variant="body2" color="textSecondary" component="p">
                  {dataset.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          )
        )}
      </div>
    );
}

export default ProjectDemoData;

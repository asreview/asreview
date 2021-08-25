import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";

import Truncate from "react-truncate";

const TRUNCATE_WIDTH_OFFSET = -56;

const useStyles = makeStyles((theme) => ({
  icon: {
    marginLeft: "auto",
  },
}));

const LabeledRecordCard = (props) => {
  const classes = useStyles();

  const cardRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(null);

  useEffect(() => {
    if (cardRef.current) {
      setCardWidth(cardRef.current.offsetWidth);
    }
  }, []);

  return (
    <Card>
      <CardContent ref={cardRef}>
        <Typography gutterBottom variant="h6">
          {props.value.title
            ? props.value.title
            : "This record doesn't have a title."}
        </Typography>
        <Truncate
          lines={6}
          ellipsis={
            <span>
              ...{" "}
              <Link
                component="button"
                underline="none"
                onClick={(event) => props.handleClick(event, props.index)}
              >
                read more
              </Link>
            </span>
          }
          width={cardWidth + TRUNCATE_WIDTH_OFFSET}
        >
          {props.value.abstract
            ? props.value.abstract
            : "This record doesn't have an abstract."}
        </Truncate>
      </CardContent>
      <CardActions>
        <Tooltip
          title={
            props.value.included === 1
              ? "Convert to irrelevant"
              : "Convert to relevant"
          }
        >
          <IconButton
            className={classes.icon}
            onClick={() => {
              props.updateInstance(props.value.id, props.value.included);
            }}
          >
            {props.value.included === 1 ? (
              <FavoriteIcon color="secondary" fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default LabeledRecordCard;

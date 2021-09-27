import React from "react";
import { connect } from "react-redux";
import TruncateMarkup from "react-truncate-markup";
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import { mapStateToProps } from "../../globals.js";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
  },
  icon: {
    marginLeft: "auto",
  },
}));

const LabeledRecordCard = (props) => {
  const classes = useStyles();

  const [recordReadMore, setRecordReadMore] = React.useState(null);

  return (
    <React.Fragment>
      {props.page.result.map((value) => (
        <Card className={classes.root} key={value.id}>
          <CardContent>
            <Typography gutterBottom variant="h6">
              {value.title ? value.title : "This record doesn't have a title."}
            </Typography>
            <TruncateMarkup
              lines={value.id === recordReadMore ? Infinity : 6}
              ellipsis={
                <span>
                  ...{" "}
                  <Link
                    component="button"
                    underline="none"
                    onClick={() => setRecordReadMore(value.id)}
                  >
                    read more
                  </Link>
                </span>
              }
            >
              <div>
                {value.abstract
                  ? value.abstract
                  : "This record doesn't have an abstract."}
              </div>
            </TruncateMarkup>
          </CardContent>
          <CardActions>
            <Tooltip
              title={
                value.included === 1
                  ? "Convert to irrelevant"
                  : "Convert to relevant"
              }
            >
              <IconButton
                className={classes.icon}
                onClick={() => {
                  props.mutateClassification({
                    project_id: props.project_id,
                    doc_id: value.id,
                    label: value.included,
                    initial: false,
                  });
                }}
                size="large"
              >
                {value.included === 1 ? (
                  <FavoriteIcon color="secondary" fontSize="small" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      ))}
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(LabeledRecordCard);

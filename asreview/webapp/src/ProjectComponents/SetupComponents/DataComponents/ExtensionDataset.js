import React from "react";
import {
  Card,
  CardActions,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CheckCircleOutline, RadioButtonUnchecked } from "@mui/icons-material";

const PREFIX = "ExtensionDataset";

const classes = {
  icon: `${PREFIX}-icon`,
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  [`& .${classes.icon}`]: {
    justifyContent: "flex-end",
    paddingRight: 16,
    paddingBottom: 16,
  },
}));

const ExtensionDataset = (props) => {
  const handleExtension = (dataset_id) => {
    if (props.isAddDatasetError) {
      props.reset();
    }
    if (!props.isAddingDataset) {
      props.setExtension(dataset_id);
    }
  };

  const returnCheckedIcon = (dataset_id) => {
    if (props.extension === dataset_id) {
      return <CheckCircleOutline color="primary" />;
    } else {
      return <RadioButtonUnchecked />;
    }
  };

  function DataSetCard(dataset) {
    return (
      <StyledCard onClick={() => handleExtension(dataset.dataset_id)}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="140"
            image={dataset.img_url}
            alt={dataset.title}
          />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              {dataset.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dataset.description}
            </Typography>
          </CardContent>
          <CardActions className={classes.icon}>
            {returnCheckedIcon(dataset.dataset_id)}
          </CardActions>
        </CardActionArea>
      </StyledCard>
    );
  }

  if (props.dataset.constructor === Array) {
    return DataSetCard(props.dataset[props.dataset.length - 1]);
  } else {
    return DataSetCard(props.dataset);
  }
};

export default ExtensionDataset;

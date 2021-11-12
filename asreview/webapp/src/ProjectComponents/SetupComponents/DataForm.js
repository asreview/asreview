import * as React from "react";
import { useQueryClient } from "react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Check } from "@mui/icons-material";

import { InlineErrorHandler } from "../../Components";

const PREFIX = "DataForm";

const classes = {
  title: `${PREFIX}-title`,
  cardContent: `${PREFIX}-card-content`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 24,
  },
  [`& .${classes.cardContent}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
  },
}));

const DataForm = (props) => {
  const queryClient = useQueryClient();

  const refetchLabeledStats = () => {
    queryClient.resetQueries("fetchLabeledStats");
  };
  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Data</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Active learning models help you accelerate the review of records in
          your dataset (e.g., abstracts of scientific papers) by learning your
          preferences.
        </Typography>
      </Box>
      <Box>
        <Stack direction="column" spacing={3}>
          <Card elevation={3}>
            <CardContent className={classes.cardContent}>
              <Box>
                <Typography variant="subtitle1">Add a dataset</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Contain all records related to a particular topic
                </Typography>
              </Box>
              <Stack direction="row" sx={{ alignItems: "center" }}>
                {props.details?.projectHasDataset && (
                  <Check color="success" sx={{ mr: 1 }} />
                )}
                <Button onClick={props.toggleAddDataset}>
                  {!props.details?.projectHasDataset ? "Add" : "Edit"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
          <Card elevation={3}>
            <CardContent className={classes.cardContent}>
              <Box>
                <Typography variant="subtitle1">Add prior knowledge</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Indicate your preference with at least 1 relevant and 1
                  irrelevant records
                </Typography>
              </Box>
              <Box>
                <Button
                  disabled={!props.details?.projectHasDataset}
                  onClick={props.toggleAddPriorKnowledge}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
          {props.isError && (
            <InlineErrorHandler
              message={props.error?.message}
              refetch={refetchLabeledStats}
              button="Try to refresh"
            />
          )}
        </Stack>
      </Box>
    </Root>
  );
};

export default DataForm;

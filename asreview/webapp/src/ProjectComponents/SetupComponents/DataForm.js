import * as React from "react";
import { useQueryClient } from "react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Check, Warning } from "@mui/icons-material";

const PREFIX = "DataForm";

const classes = {
  title: `${PREFIX}-title`,
  cardContent: `${PREFIX}-card-content`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 16,
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

  const refetchPriorStats = () => {
    queryClient.resetQueries("fetchPriorStats");
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
                  Import a systematic review dataset
                </Typography>
              </Box>
              <Stack direction="row" sx={{ alignItems: "center" }}>
                {props.details?.projectHasDataset && <Check color="success" />}
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
                  Label at least 1 relevant and 1 irrelevant records to indicate
                  your preference
                </Typography>
              </Box>
              <Box>
                <Button disabled={!props.details?.projectHasDataset}>
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
          {props.isError && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: "center" }}
            >
              <Warning color="error" fontSize="small" />
              <Typography variant="body2">
                {props.error?.message}{" "}
                <Link
                  component="button"
                  underline="none"
                  onClick={refetchPriorStats}
                >
                  Try to refresh
                </Link>
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Root>
  );
};

export default DataForm;

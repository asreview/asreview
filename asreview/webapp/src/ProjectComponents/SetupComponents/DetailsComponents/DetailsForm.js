import * as React from "react";
import Confetti from "react-confetti";
import { useQueryClient } from "react-query";
import {
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../../Components";
import { DetailsModeSelect } from "../DetailsComponents";

const PREFIX = "DetailsForm";

const classes = {
  title: `${PREFIX}-title`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 24,
  },

  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
  },
}));

const DetailsForm = (props) => {
  const onFocus = () => props.setTextFieldFocused(true);
  const onBlur = () => props.setTextFieldFocused(false);

  const queryClient = useQueryClient();

  const refetchDetails = () => {
    queryClient.resetQueries("fetchInfo");
  };

  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Details</Typography>
      </Box>
      <Stack spacing={3}>
        {props.isFetchingDetails && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
        {!props.isFetchingDetails && !props.isFetchDetailsError && (
          <Box component="form" noValidate autoComplete="off">
            <Stack direction="column" spacing={3}>
              <DetailsModeSelect
                disableModeSelect={props.disableModeSelect}
                mode={props.details.mode}
                handleMode={props.handleChange}
                showSimulate={props.showSimulate}
                onBlur={onBlur}
                onFocus={onFocus}
              />
              {props.showSimulate && (
                <Box>
                  <Typography color="error">
                    You unlocked the experimental simulation mode!
                  </Typography>
                  <Confetti
                    recycle={false}
                    tweenDuration={50000}
                    numberOfPieces={1000}
                  />
                </Box>
              )}
              <TextField
                fullWidth
                autoFocus
                error={props.isError}
                inputProps={{
                  onFocus: () => onFocus(),
                  onBlur: () => onBlur(),
                }}
                required
                name="title"
                id="project-title"
                label="Title"
                onChange={props.handleChange}
                value={props.details.title}
                helperText={props.error?.message}
              />
              <TextField
                fullWidth
                inputProps={{
                  onFocus: () => onFocus(),
                  onBlur: () => onBlur(),
                }}
                name="authors"
                id="project-author"
                label="Author(s)"
                onChange={props.handleChange}
                value={props.details.authors}
              />
              <TextField
                fullWidth
                inputProps={{
                  onFocus: () => onFocus(),
                  onBlur: () => onBlur(),
                }}
                multiline
                rows={4}
                name="description"
                id="project-description"
                label="Description"
                onChange={props.handleChange}
                value={props.details.description}
              />
            </Stack>
          </Box>
        )}
        {props.isFetchDetailsError && (
          <InlineErrorHandler
            message={props.fetchDetailsError?.message}
            refetch={refetchDetails}
            button={true}
          />
        )}
      </Stack>
    </Root>
  );
};

export default DetailsForm;

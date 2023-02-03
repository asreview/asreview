import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../Components";
import { TypographySubtitle1Medium } from "../StyledComponents/StyledTypography.js";
import { ProjectAPI } from "../api/index.js";
import { mapStateToProps } from "../globals.js";

const PREFIX = "ProjectInfoForm";

const classes = {
  cardContent: `${PREFIX}-card-content`,
  cardOverlay: `${PREFIX}-card-overlay`,
  singleLine: `${PREFIX}-single-line`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.cardContent}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingRight: 8,
    position: "relative",
  },
}));

const ProjectInfoForm = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const { data, error, isError, isFetching, refetch } = useQuery(
    ["fetchData", { project_id: props.project_id }],
    ProjectAPI.fetchData,
    {
      enabled: props.project_id !== null,
      refetchOnWindowFocus: false,
    }
  );

  const fetchInfoState = queryClient.getQueryState([
    "fetchInfo",
    { project_id: props.project_id },
  ]);

  const isProjectSetup = () => {
    return !project_id;
  };

  const onFocus = () => {
    if (!isProjectSetup()) {
      // do nothing
    } else {
      props.setTextFieldFocused(true);
    }
  };

  const onBlur = () => {
    if (!isProjectSetup()) {
      // do nothing
    } else {
      props.setTextFieldFocused(false);
    }
  };

  const handleInfoChange = (event) => {
    if (!isProjectSetup()) {
      props.setInfo({
        ...props.info,
        [event.target.name]: event.target.value,
      });
      props.setDisableButton(false);
    } else {
      props.handleInfoChange(event);
    }
  };

  const isTitleValidated = () => {
    return props.info.title.length >= 3;
  };

  const refetchInfo = () => {
    queryClient.resetQueries("fetchInfo");
  };

  return (
    <Root
      style={{
        width: !props.mobileScreen && !isProjectSetup() ? "60%" : "100%",
      }}
    >
      <Stack spacing={3}>
        <Box>
          {isProjectSetup() && (
            <Typography variant="h6">Project information</Typography>
          )}
          {!isProjectSetup() && (
            <TypographySubtitle1Medium>
              Project information
            </TypographySubtitle1Medium>
          )}
        </Box>
        {isProjectSetup() && (fetchInfoState?.isFetching || isFetching) && (
          <Box className="main-page-body-wrapper">
            <CircularProgress />
          </Box>
        )}
        {((isProjectSetup() &&
          fetchInfoState.status !== "error" &&
          !fetchInfoState.isFetching &&
          !isError &&
          !isFetching) ||
          !isProjectSetup()) && (
          <Box>
            <Grid container columnSpacing={3}>
              <Grid item xs={12} sm={!isProjectSetup() ? 12 : 8}>
                <Stack direction="column" spacing={3}>
                  <Tooltip
                    disableHoverListener
                    title="Title must have at least 3 characters"
                    arrow
                    open={!isTitleValidated()}
                    placement="top-start"
                  >
                    <TextField
                      autoFocus
                      // error={props.isMutateInfoError}
                      error={!isTitleValidated()}
                      fullWidth
                      helperText={props.mutateInfoError?.message}
                      id="project-title"
                      inputProps={{
                        onFocus: () => onFocus(),
                        onBlur: () => onBlur(),
                      }}
                      InputLabelProps={{
                        required: false,
                      }}
                      label="Title (required)"
                      name="title"
                      onChange={handleInfoChange}
                      required
                      value={props.info?.title}
                    />
                  </Tooltip>
                  <TextField
                    fullWidth
                    id="project-author"
                    inputProps={{
                      onFocus: () => onFocus(),
                      onBlur: () => onBlur(),
                    }}
                    label="Author(s)"
                    name="authors"
                    onChange={handleInfoChange}
                    value={props.info?.authors}
                  />
                  <TextField
                    fullWidth
                    id="project-description"
                    inputProps={{
                      onFocus: () => onFocus(),
                      onBlur: () => onBlur(),
                    }}
                    label="Description"
                    multiline
                    minRows={8}
                    name="description"
                    onChange={handleInfoChange}
                    value={props.info?.description}
                  />
                </Stack>
              </Grid>
              {isProjectSetup() && (
                <Grid item xs={12} sm={4}>
                  <Stack>
                    <Card
                      elevation={0}
                      sx={{
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "background.paper"
                            : "grey.100",
                      }}
                    >
                      <CardContent>
                        <Box
                          className={classes.cardOverlay}
                          sx={{
                            bgcolor: (theme) => {
                              if (
                                props.datasetAdded !== undefined &&
                                !props.datasetAdded
                              ) {
                                if (theme.palette.mode === "dark") {
                                  return "rgba(40, 40, 40, 0.7)";
                                } else {
                                  return "rgba(255, 255, 255, 0.5)";
                                }
                              } else {
                                return "transparent";
                              }
                            },
                          }}
                        />
                        <Stack spacing={2}>
                          <Stack>
                            <Typography
                              variant="body2"
                              className={classes.singleLine}
                              sx={{ color: "text.secondary" }}
                            >
                              Dataset filename
                            </Typography>
                            <Typography
                              variant="body2"
                              className={classes.singleLine}
                            >
                              {props.info?.dataset_path}
                            </Typography>
                          </Stack>
                          <Stack>
                            <Typography
                              variant="body2"
                              className={classes.singleLine}
                              sx={{ color: "text.secondary" }}
                            >
                              Records
                            </Typography>
                            <Typography
                              variant="body2"
                              className={classes.singleLine}
                            >
                              {data?.n_rows}
                            </Typography>
                          </Stack>
                          <Stack>
                            <Typography
                              variant="body2"
                              className={classes.singleLine}
                              sx={{ color: "text.secondary" }}
                            >
                              Duplicates
                            </Typography>
                            <Typography
                              variant="body2"
                              className={classes.singleLine}
                            >
                              About {data?.n_duplicates}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        {isProjectSetup() && fetchInfoState.status === "error" && (
          <InlineErrorHandler
            message={fetchInfoState.error?.message}
            refetch={refetchInfo}
            button
          />
        )}
        {isProjectSetup() && isError && (
          <InlineErrorHandler
            message={error?.message}
            refetch={refetch}
            button
          />
        )}
        {props.isDeleteProjectError && (
          <InlineErrorHandler message={props.deleteProjectError?.message} />
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(ProjectInfoForm);

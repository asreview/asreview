import * as React from "react";
import { connect } from "react-redux";
import { useMutation, useQuery } from "react-query";

import { Box, CircularProgress, Grid, Typography, styled } from "@mui/material";

import { CardErrorHandler } from "../../../Components";
import { InlineErrorHandler } from "../../../Components";
import { DatasetInfo } from "../InfoComponents";
import { ProjectInfo } from "../../../ProjectComponents";

import { ProjectAPI } from "../../../api";
import { mapStateToProps } from "../../../globals.js";

const PREFIX = "InfoForm";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  error: `${PREFIX}-error`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: "flex",
  },
  [`& .${classes.title}`]: {
    paddingBottom: 24,
  },
  [`& .${classes.error}`]: {
    marginBottom: 16,
  },
}));

const InfoForm = (props) => {
  const [info, setInfo] = React.useState({
    title: "",
    authors: "",
    description: "",
    dataset_path: undefined,
  });

  const [textFiledFocused, setTextFieldFocused] = React.useState(null); // for autosave on blur

  /**
   * Fetch dataset info
   */
  const {
    data,
    error: fetchDataError,
    isError: isFetchDataError,
    isFetching: isFetchingData,
  } = useQuery(
    ["fetchData", { project_id: props.project_id }],
    ProjectAPI.fetchData,
    {
      enabled: props.project_id !== null,
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Fetch project info
   */
  const {
    error: fetchInfoError,
    isError: isFetchInfoError,
    isFetching: isFetchingInfo,
  } = useQuery(
    ["fetchInfo", { project_id: props.project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: props.project_id !== null,
      onSuccess: (data) => {
        props.setTitle(data["name"]);
        setInfo({
          title: data["name"],
          authors: data["authors"] ? data["authors"] : "",
          description: data["description"] ? data["description"] : "",
          dataset_path: data.dataset_path,
        });
      },
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Mutate project info
   */
  const {
    error: mutateInfoError,
    isError: isMutateInfoError,
    // {TODO} isLoading: isMutatingInfo,
    mutate,
    reset,
  } = useMutation(ProjectAPI.mutateInfo, {
    mutationKey: ["mutateInfo"],
    onSuccess: () => {
      setTextFieldFocused(null);
    },
  });

  // auto mutate info when text field is not focused
  React.useEffect(() => {
    if (
      props.project_id !== null &&
      textFiledFocused !== null &&
      !textFiledFocused &&
      !(info.title.length < 1) &&
      !isMutateInfoError
    ) {
      mutate({
        project_id: props.project_id,
        title: info.title,
        authors: info.authors,
        description: info.description,
      });
    }
  }, [info, isMutateInfoError, mutate, props.project_id, textFiledFocused]);

  const handleInfoChange = (event) => {
    if (event.target.name === "title") {
      props.setTitle(event.target.value);
    }
    setInfo({
      ...info,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="h6">Project Information</Typography>
      </Box>
      {isMutateInfoError && (
        <Box className={classes.error}>
          <InlineErrorHandler
            message={mutateInfoError?.message}
            refetch={reset}
            button
          />
        </Box>
      )}

      {!isFetchingData &&
        !isFetchingInfo &&
        !isFetchDataError &&
        !isFetchInfoError && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <ProjectInfo
                info={info}
                isTitleValidated={props.isTitleValidated}
                handleInfoChange={handleInfoChange}
                setTextFieldFocused={setTextFieldFocused}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatasetInfo data={data} info={info} />
            </Grid>
          </Grid>
        )}

      {(isFetchingData || isFetchingInfo) && (
        <Box className="main-page-body-wrapper">
          <CircularProgress />
        </Box>
      )}
      <CardErrorHandler
        queryKey={"fetchData"}
        error={fetchDataError}
        isError={isFetchDataError}
      />

      <CardErrorHandler
        queryKey={"fetchInfo"}
        error={fetchInfoError}
        isError={isFetchInfoError}
      />
    </Root>
  );
};

export default connect(mapStateToProps)(InfoForm);

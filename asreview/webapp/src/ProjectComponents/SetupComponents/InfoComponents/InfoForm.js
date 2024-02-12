import * as React from "react";
import { useContext } from "react";
import { useMutation, useQuery } from "react-query";
import clsx from "clsx";
import {
  Box,
  Button,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ProjectAPI } from "../../../api";
import { CardErrorHandler } from "../../../Components";
import { ProjectContext } from "../../../ProjectContext";

const PREFIX = "InfoForm";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  error: `${PREFIX}-error`,
  textField: `${PREFIX}-textField`,
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
  [`& .${classes.textField}`]: {
    marginTop: 0,
  },
}));

const InfoForm = ({ editable = true }) => {
  const project_id = useContext(ProjectContext);

  const [info, setInfo] = React.useState({
    title: "",
    authors: "",
    description: "",
  });

  // const isProjectSetup = () => {
  //   return !project_id;
  // };

  const onFocus = () => {};

  const onBlur = () => {};

  const handleInfoChange = (event) => {
    setInfo({
      ...info,
      [event.target.name]: event.target.value,
    });
  };

  /**
   * Fetch project info
   */
  const { error: fetchInfoError, isError: isFetchInfoError } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: project_id !== null,
      onSuccess: (data) => {
        setInfo({
          title: data["name"],
          authors: data["authors"] ? data["authors"] : "",
          description: data["description"] ? data["description"] : "",
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
  } = useMutation(ProjectAPI.mutateInfo, {
    mutationKey: ["mutateInfo"],
    onError: () => {
      // handleComplete(false);
    },
    onSuccess: () => {
      // setTextFieldFocused(null);
    },
  });

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="h6">Project Information</Typography>
      </Box>
      <Stack spacing={3}>
        <Box>
          <Stack direction="column" spacing={3}>
            <Tooltip
              disableHoverListener
              title="Your project needs a title"
              arrow
              open={info?.title.length === 0}
              placement="top-start"
            >
              <TextField
                autoFocus
                error={mutateInfoError}
                fullWidth
                id="project-title"
                inputProps={{
                  onFocus: () => onFocus(),
                }}
                InputLabelProps={{
                  required: true,
                }}
                label="Title"
                name="title"
                onChange={handleInfoChange}
                required
                value={info?.title}
                disabled={!editable}
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
              value={info?.authors}
              disabled={!editable}
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
              value={info?.description}
              disabled={!editable}
            />

            {/* add save button */}
            <Button
              onClick={() => {
                mutate({
                  project_id: project_id,
                  title: info.title,
                  authors: info.authors,
                  description: info.description,
                });
              }}
              disabled={!editable}
            >
              Save
            </Button>
          </Stack>
        </Box>

        <CardErrorHandler
          queryKey={"fetchInfo"}
          error={fetchInfoError}
          isError={isFetchInfoError}
        />
      </Stack>
    </Root>
  );
};

export default InfoForm;

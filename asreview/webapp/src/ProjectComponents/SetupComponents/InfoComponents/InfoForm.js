import * as React from "react";
import { useContext } from "react";
import { useMutation, useQuery } from "react-query";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ProjectAPI } from "api";
import { CardErrorHandler } from "Components";
import { ProjectContext } from "ProjectContext";
import { useToggle } from "hooks/useToggle";
import { Edit } from "@mui/icons-material";

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

const InfoForm = ({ projectInfo, editable = true }) => {
  const project_id = projectInfo.id;

  const [info, setInfo] = React.useState(projectInfo);
  const [editProjectInfo, toggleEditProjectInfo] = useToggle(false);

  const handleInfoChange = (event) => {
    setInfo({
      ...info,
      [event.target.name]: event.target.value,
    });
  };

  const saveInfo = () => {
    mutate({
      project_id: project_id,
      title: info.name || "",
      authors: info.authors || "",
      description: info.description || "",
    });
  };

  const { isLoading: isMutatingInfo, mutate } = useMutation(
    ProjectAPI.mutateInfo,
    {
      mutationKey: ["mutateInfo"],
      onSuccess: () => {
        toggleEditProjectInfo();
      },
    },
  );

  const isChanged = () => {
    return (
      // projectInfo !== undefined &&
      // info !== null &&
      projectInfo?.name !== info.name ||
      projectInfo?.authors !== info.authors ||
      projectInfo?.description !== info.description
    );
  };

  console.log(info);

  return (
    <Root className={classes.root}>
      {!editProjectInfo && (
        <Stack alignItems="center" direction="row" gap={2}>
          <Typography variant="h6">Project title:</Typography>
          <Typography>{info?.name}</Typography>
          <IconButton onClick={toggleEditProjectInfo} disabled={!editable}>
            <Edit />
          </IconButton>
        </Stack>
      )}
      {editProjectInfo && (
        <Stack spacing={3}>
          <>
            <Stack direction="column" spacing={3}>
              <Tooltip
                disableHoverListener
                title="Your project needs a title"
                arrow
                open={info?.name.length === 0}
                placement="top-start"
              >
                <TextField
                  autoFocus
                  // error={mutateInfoError}
                  fullWidth
                  id="project-title"
                  InputLabelProps={{
                    required: true,
                  }}
                  label="Title"
                  name="name"
                  onChange={handleInfoChange}
                  required
                  value={info?.name || ""}
                  disabled={!editable}
                />
              </Tooltip>
              <TextField
                fullWidth
                id="project-author"
                label="Author(s)"
                name="authors"
                onChange={handleInfoChange}
                value={info?.authors || ""}
                disabled={!editable}
              />
              <TextField
                fullWidth
                id="project-description"
                label="Description"
                multiline
                minRows={8}
                name="description"
                onChange={handleInfoChange}
                value={info?.description || ""}
                disabled={!editable}
              />
              <Button onClick={saveInfo} disabled={!isChanged()}>
                Save
              </Button>
            </Stack>
          </>
        </Stack>
      )}
    </Root>
  );
};

export default InfoForm;

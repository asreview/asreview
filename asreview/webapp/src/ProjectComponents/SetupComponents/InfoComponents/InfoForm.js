import * as React from "react";
import { useMutation } from "react-query";
import {
  Box,
  Button,
  Paper,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";
import { Edit } from "@mui/icons-material";

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

  return (
    <>
      {!editProjectInfo && (
        <Paper>
          <Stack alignItems="center" direction="row">
            <Typography>Project: {info?.name}</Typography>
            <IconButton onClick={toggleEditProjectInfo} disabled={!editable}>
              <Edit />
            </IconButton>
          </Stack>
          {/* <TextField id="standard-basic" label="authors" variant="standard" /> */}
          <Typography>
            Authors:{" "}
            <Box sx={{ fontStyle: "italic", opacity: 0.3, display: "inline" }}>
              {info?.authors}
            </Box>
          </Typography>
          <Typography>Description: {info?.description}</Typography>
        </Paper>
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
              <Button onClick={toggleEditProjectInfo}>Cancel</Button>
              <Button onClick={saveInfo} disabled={!isChanged()}>
                Save
              </Button>
            </Stack>
          </>
        </Stack>
      )}
    </>
  );
};

export default InfoForm;

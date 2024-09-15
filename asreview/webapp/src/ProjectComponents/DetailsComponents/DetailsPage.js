import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { ProjectDeleteDialog } from "ProjectComponents";
import {
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";

import { ProjectContext } from "context/ProjectContext";
import { projectStatuses } from "globals.js";
import useAuth from "hooks/useAuth";
import { useToggle } from "hooks/useToggle";
import { ProjectAPI } from "api";

const Root = styled("div")(({ theme }) => ({}));
const DeleteCard = ({ project_id, info }) => {
  const [onDeleteDialog, toggleDeleteDialog] = useToggle();

  return (
    <Box sx={{ padding: "12px 0px" }}>
      <Card>
        <CardHeader
          title="Danger zone"
          subheader="Delete project permanently. This action cannot be undone."
        />
        <CardContent>
          <Button
            variant="contained"
            color="error"
            onClick={toggleDeleteDialog}
          >
            Delete project
          </Button>
          <ProjectDeleteDialog
            onDeleteDialog={onDeleteDialog}
            toggleDeleteDialog={toggleDeleteDialog}
            projectTitle={info?.name}
            project_id={project_id}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
const MarkFinishedCard = ({ project_id }) => {
  const queryClient = useQueryClient();
  const { data } = useQuery(
    ["fetchProjectStatus", { project_id }],
    ProjectAPI.fetchProjectStatus,
  );
  const { mutate } = useMutation(ProjectAPI.mutateReviewStatus, {
    onSuccess: (data) => {
      queryClient.setQueryData(["fetchProjectStatus", { project_id }], data);
      queryClient.invalidateQueries(["fetchProjectInfo", { project_id }]);
    },
  });

  return (
    <Card>
      <CardHeader
        title="Project status"
        subheader="Mark the project as finished. This disables new label actions. Can be reverted."
      />
      <CardContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={data?.status === projectStatuses.FINISHED}
                onClick={(event) => {
                  mutate({
                    project_id: project_id,
                    status: event.target.checked
                      ? projectStatuses.FINISHED
                      : projectStatuses.REVIEW,
                  });
                }}
              />
            }
            label="Mark the project as finished"
          />
        </FormGroup>
      </CardContent>
    </Card>
  );
};
const DetailsPage = ({ info }) => {
  const { project_id } = useParams();
  const { auth } = useAuth();

  return (
    <Root aria-label="details page">
      <Container maxWidth="md">
        <ProjectContext.Provider value={project_id}>
          <Box sx={{ padding: "12px 0px" }}>
            <TagCard editable={false} />
          </Box>
          <Box sx={{ padding: "12px 0px" }}>
            <ModelCard editable={true} showWarning={true} />
          </Box>
          <Box sx={{ padding: "12px 0px" }}>
            <PriorCard editable={false} />
          </Box>
          {info?.ownerId === auth?.id && (
            <>
              <Box sx={{ padding: "12px 0px" }}>
                <MarkFinishedCard project_id={project_id} info={info} />
              </Box>
              <Box sx={{ padding: "12px 0px" }}>
                <DeleteCard project_id={project_id} info={info} />
              </Box>
            </>
          )}
        </ProjectContext.Provider>
      </Container>
    </Root>
  );
};
export default DetailsPage;

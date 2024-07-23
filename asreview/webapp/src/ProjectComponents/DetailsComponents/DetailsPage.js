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

const DetailsPage = ({ info }) => {
  const { project_id } = useParams();

  const { auth } = useAuth();

  const handleChangeStatus = (event) => {};

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
                            defaultChecked={
                              info?.reviews[0].status === projectStatuses.REVIEW
                            }
                            onClick={handleChangeStatus}
                          />
                        }
                        label="Mark the project as finished"
                      />
                    </FormGroup>
                  </CardContent>
                </Card>
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

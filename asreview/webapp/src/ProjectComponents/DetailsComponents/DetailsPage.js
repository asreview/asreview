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
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";

import { ProjectDeleteDialog } from "ProjectComponents";
import {
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";

import { ProjectContext } from "ProjectContext";
import { projectStatuses } from "globals.js";
import { useToggle } from "hooks/useToggle";
import useAuth from "hooks/useAuth";

const Root = styled("div")(({ theme }) => ({}));

const DetailsPage = (props) => {
  const { project_id } = useParams();
  const [onDeleteDialog, toggleDeleteDialog] = useToggle();

  const { auth } = useAuth();

  console.log(auth);

  const handleChangeStatus = (event) => {};

  const handleClickDelete = () => {
    // handleCloseOptions();
    toggleDeleteDialog();
  };

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
          <Box sx={{ padding: "12px 0px" }}>
            <Typography variant="h6">Project status</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    defaultChecked={
                      props.info?.reviews[0].status === projectStatuses.REVIEW
                    }
                    onClick={handleChangeStatus}
                  />
                }
                label="Mark the project as finished. This disables new label actions. Can be reverted."
              />
            </FormGroup>
          </Box>

          {/* Add delete project button */}
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
                  onClick={handleClickDelete}
                >
                  Delete project
                </Button>
                <ProjectDeleteDialog
                  onDeleteDialog={onDeleteDialog}
                  toggleDeleteDialog={toggleDeleteDialog}
                  projectTitle={props.info?.name}
                  project_id={project_id}
                />
              </CardContent>
            </Card>
          </Box>
        </ProjectContext.Provider>
      </Container>
    </Root>
  );
};

export default DetailsPage;

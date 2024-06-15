import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
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
import { TypographyH5Medium } from "StyledComponents/StyledTypography";
import { projectStatuses } from "globals.js";
import { useToggle } from "hooks/useToggle";

const Root = styled("div")(({ theme }) => ({}));

const DetailsPage = (props) => {
  const { project_id } = useParams();
  const [onDeleteDialog, toggleDeleteDialog] = useToggle();

  const handleChangeStatus = (event) => {};

  const handleClickDelete = () => {
    // handleCloseOptions();
    toggleDeleteDialog();
  };

  return (
    <Root aria-label="details page">
      <Box className="main-page-sticky-header with-button">
        {!props.mobileScreen && (
          <TypographyH5Medium>Details</TypographyH5Medium>
        )}
        {props.mobileScreen && <Typography variant="h6">Details</Typography>}
      </Box>

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
            <Typography variant="h6">Danger zone</Typography>
            <LoadingButton
              variant="contained"
              color="error"
              onClick={handleClickDelete}
            >
              Delete project
            </LoadingButton>
          </Box>
        </ProjectContext.Provider>
      </Container>
      <ProjectDeleteDialog
        onDeleteDialog={onDeleteDialog}
        toggleDeleteDialog={toggleDeleteDialog}
        projectTitle={props.info?.name}
        project_id={project_id}
      />
    </Root>
  );
};

export default DetailsPage;

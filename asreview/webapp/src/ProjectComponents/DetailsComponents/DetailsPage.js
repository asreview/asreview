import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MoreVert } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";

import { ProjectInfo, ProjectDeleteDialog } from "../../ProjectComponents";
import { ActionsFeedbackBar } from "../../Components";
import { ScreenLanding } from "../SetupComponents/ScreenComponents";
import { ModelForm } from "../SetupComponents/ModelComponents";
import { DataForm } from "../SetupComponents/DataComponents";

import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";
import { ProjectAPI } from "../../api/index.js";
import { projectModes, projectStatuses } from "../../globals.js";
import { useToggle } from "../../hooks/useToggle";
import { ProjectContext } from "../../ProjectContext.js";

const Root = styled("div")(({ theme }) => ({}));

const DetailsPage = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  console.log("DetailsPage", project_id);
  console.log("DetailsPage", props.info);

  const [onDeleteDialog, toggleDeleteDialog] = useToggle();

  const handleChangeStatus = (event) => {};

  const handleClickOptions = (event) => {
    // setAnchorEl(event.currentTarget);
  };

  const handleCloseOptions = () => {
    // setAnchorEl(null);
  };

  const handleClickDelete = () => {
    handleCloseOptions();
    toggleDeleteDialog();
  };

  // React.useEffect(() => {
  // }, [props.info]);

  return (
    <Root aria-label="details page">
      <Fade in>
        <Box>
          {/* Page title */}
          <Box
            className="main-page-sticky-header-wrapper"
            sx={{ background: (theme) => theme.palette.background.paper }}
          >
            <Box className="main-page-sticky-header with-button">
              {!props.mobileScreen && (
                <TypographyH5Medium>Details</TypographyH5Medium>
              )}
              {props.mobileScreen && (
                <Typography variant="h6">Details</Typography>
              )}
            </Box>
          </Box>

          {/* Page body */}
          <Box>
            <ProjectContext.Provider value={project_id}>
              <ProjectInfo mobileScreen={props.mobileScreen} editable={true} />
              <DataForm
                editable={false}
                setHistoryFilterQuery={props.setHistoryFilterQuery}
              />
              <ModelForm editable={true} />
              <ScreenLanding />

              <Box>
                <Typography variant="h6">Project status</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={
                          props.info?.reviews[0].status ===
                          projectStatuses.REVIEW
                        }
                        onClick={handleChangeStatus}
                      />
                    }
                    label="Mark the project as finished. This disables new label actions. Can be reverted."
                  />
                </FormGroup>
              </Box>

              {/* Add delete project button */}
              <Box>
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
          </Box>
        </Box>
      </Fade>
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

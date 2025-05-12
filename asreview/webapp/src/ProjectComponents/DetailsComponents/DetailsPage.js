import { Container, Stack } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";

import {
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";

import { ProjectContext } from "context/ProjectContext";
import { projectModes } from "globals.js";

const DetailsPage = () => {
  const { project_id } = useParams();
  const location = useLocation();
  const mode = location.pathname.includes("reviews") ? "oracle" : "simulate";

  return (
    <ProjectContext.Provider value={project_id}>
      <Container maxWidth="md" aria-label="details page" sx={{ mb: 3 }}>
        <Stack spacing={3}>
          {mode !== projectModes.SIMULATION && <TagCard editable={false} />}
          <ModelCard mode={mode} editable={mode !== projectModes.SIMULATION} />
          <PriorCard mode={mode} editable={mode !== projectModes.SIMULATION} />
        </Stack>
      </Container>
    </ProjectContext.Provider>
  );
};
export default DetailsPage;

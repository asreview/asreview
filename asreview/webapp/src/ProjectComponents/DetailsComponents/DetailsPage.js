import { Container, Stack } from "@mui/material";
import { useParams, useLocation } from "react-router-dom";

import {
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";

import { ProjectContext } from "context/ProjectContext";

const DetailsPage = () => {
  const { project_id } = useParams();
  const location = useLocation();
  const mode = location.pathname.includes("reviews") ? "oracle" : "simulate";

  return (
    <ProjectContext.Provider value={project_id}>
      <Container maxWidth="md" aria-label="details page" sx={{ mb: 3 }}>
        <Stack spacing={3}>
          {mode === "oracle" && <TagCard editable={false} />}
          <ModelCard
            mode={mode}
            editable={mode === "oracle"}
            showWarning={true}
          />
          <PriorCard editable={mode === "oracle"} mode={mode} />
        </Stack>
      </Container>
    </ProjectContext.Provider>
  );
};
export default DetailsPage;

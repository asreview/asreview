import { Container, Stack } from "@mui/material";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import {
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";

import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";

const DetailsPage = () => {
  const { project_id } = useParams();

  const { data } = useQuery(
    ["fetchInfo", { project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <ProjectContext.Provider value={project_id}>
      <Container maxWidth="md" aria-label="details page" sx={{ mb: 3 }}>
        <Stack spacing={3}>
          {data?.mode === "oracle" && <TagCard editable={false} />}
          <ModelCard
            mode={data?.mode}
            editable={data?.mode === "oracle"}
            showWarning={true}
          />
          <PriorCard editable={data?.mode === "oracle"} mode={data?.mode} />
        </Stack>
      </Container>
    </ProjectContext.Provider>
  );
};
export default DetailsPage;

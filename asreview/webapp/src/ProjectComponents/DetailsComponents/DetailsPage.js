import {
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

import {
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";

import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { projectStatuses } from "globals.js";

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
          <PriorCard editable={false} />
          {data?.mode === "oracle" && data?.roles.owner && (
            <MarkFinishedCard project_id={project_id} info={data} />
          )}
        </Stack>
      </Container>
    </ProjectContext.Provider>
  );
};
export default DetailsPage;

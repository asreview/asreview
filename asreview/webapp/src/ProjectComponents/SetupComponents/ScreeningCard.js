import {
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
} from "@mui/material";
import * as React from "react";
import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";

const ScreeningCard = () => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const { data } = useQuery(
    ["fetchProject", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  const { mutate } = useMutation(ProjectAPI.mutateInfo, {
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchProject", { project_id }]);
    },
  });

  const hideLinks = data?.hide_links ?? false;

  return (
    <Card>
      <CardHeader
        title="Screening"
        subheader="Configure the screening interface"
      />
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={hideLinks}
              onChange={(e) => {
                mutate({
                  project_id: project_id,
                  hide_links: e.target.checked,
                });
              }}
            />
          }
          label="Hide DOI and URL links during screening"
        />
      </CardContent>
    </Card>
  );
};

export default ScreeningCard;

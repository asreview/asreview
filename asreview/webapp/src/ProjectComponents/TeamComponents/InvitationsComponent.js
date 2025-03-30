import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { TeamAPI } from "api";
import { formatDate, projectModes } from "globals.js";
import { useMutation, useQuery, useQueryClient } from "react-query";

const InvitationsComponent = ({ onEmpty = null }) => {
  const queryClient = useQueryClient();

  const { data: invitations } = useQuery(["getProjectInvitations"], () =>
    TeamAPI.getProjectInvitations(),
  );

  const { mutate: handleAcceptance } = useMutation(TeamAPI.acceptInvitation, {
    onSuccess: (data) => {
      queryClient.invalidateQueries("fetchProjects");

      // update the data of getProjectInvitations
      queryClient.setQueryData("getProjectInvitations", (oldData) => {
        return {
          ...oldData,
          invited_for_projects: oldData.invited_for_projects.filter(
            (project) => project.project_id !== data.project_id,
          ),
        };
      });

      const updatedInvitations = queryClient.getQueryData(
        "getProjectInvitations",
      );
      if (onEmpty && updatedInvitations?.invited_for_projects.length === 0) {
        onEmpty();
      }
    },
  });

  const { mutate: handleRejection } = useMutation(TeamAPI.rejectInvitation, {
    onSuccess: (data) => {
      queryClient.invalidateQueries("getProjectInvitations");

      // update the data of getProjectInvitations
      queryClient.setQueryData("getProjectInvitations", (oldData) => {
        return {
          ...oldData,
          invited_for_projects: oldData.invited_for_projects.filter(
            (project) => project.project_id !== data.project_id,
          ),
        };
      });

      const updatedInvitations = queryClient.getQueryData(
        "getProjectInvitations",
      );
      if (onEmpty && updatedInvitations?.invited_for_projects.length === 0) {
        onEmpty();
      }
    },
  });

  const projectOwnerInfo = (name, affiliation) => {
    const trimmedAffiliation = affiliation?.trim();

    if (!trimmedAffiliation) {
      return name;
    }
    return (
      <>
        {name}
        <br />({trimmedAffiliation})
      </>
    );
  };

  return (
    <TableContainer sx={{ my: 2 }}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "25%" }}>Project</TableCell>
            <TableCell style={{ width: "20%" }}>Invited by</TableCell>
            <TableCell style={{ width: "15%" }}>Date</TableCell>
            <TableCell style={{ width: "15%" }}>Project type</TableCell>
            <TableCell style={{ width: "25%" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invitations?.invited_for_projects.map((project) => {
            return (
              <TableRow key={project.id}>
                <TableCell sx={{ verticalAlign: "top" }}>
                  {project.name}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top" }}>
                  {projectOwnerInfo(
                    project.owner_name,
                    project.owner_affiliation,
                  )}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top" }}>
                  {formatDate(project.created_at_unix)}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top" }}>
                  {project.mode === projectModes.ORACLE && "Review"}
                  {project.mode === projectModes.SIMULATION && "Simulation"}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top" }}>
                  <Button
                    onClick={() => handleAcceptance(project.project_id)}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleRejection(project.project_id)}
                    variant="outlined"
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvitationsComponent;

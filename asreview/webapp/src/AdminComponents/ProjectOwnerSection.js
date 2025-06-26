import React from "react";
import { Box, Typography } from "@mui/material";
import UserAvatar from "./UserAvatar";

const ProjectOwnerSection = ({ project, collaborators }) => {
  // Get owner affiliation from collaborators data if available
  const ownerAffiliation = React.useMemo(() => {
    const owner = collaborators?.find((user) => user.owner);
    return owner?.affiliation;
  }, [collaborators]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <UserAvatar user={{ name: project.owner_name }} isOwner={true} />
      <Box>
        <Typography variant="body1" fontWeight="medium">
          {project.owner_name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {project.owner_email}
        </Typography>
        {ownerAffiliation && (
          <Typography variant="body2" color="textSecondary">
            {ownerAffiliation}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProjectOwnerSection;

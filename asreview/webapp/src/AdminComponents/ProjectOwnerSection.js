import React from "react";
import { Box, Typography } from "@mui/material";
import UserAvatar from "./UserAvatar";

const ProjectOwnerSection = ({ project, collaborators, onUserClick }) => {
  // Get full owner data from collaborators if available
  const ownerData = React.useMemo(() => {
    const owner = collaborators?.find((user) => user.owner);
    return owner;
  }, [collaborators]);

  const handleOwnerClick = () => {
    if (onUserClick && ownerData) {
      onUserClick(ownerData);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <UserAvatar user={{ name: project.owner_name }} isOwner={true} />
      <Box
        sx={{
          cursor: ownerData && onUserClick ? "pointer" : "default",
          "&:hover": {
            backgroundColor:
              ownerData && onUserClick ? "action.hover" : "transparent",
            borderRadius: 1,
            transition: "background-color 0.2s",
          },
          p: 1,
          borderRadius: 1,
        }}
        onClick={handleOwnerClick}
      >
        <Typography
          variant="body1"
          fontWeight="medium"
          sx={{
            color: ownerData && onUserClick ? "primary.main" : "text.primary",
            "&:hover": {
              textDecoration: ownerData && onUserClick ? "underline" : "none",
            },
          }}
        >
          {project.owner_name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {project.owner_email}
        </Typography>
        {ownerData?.affiliation && (
          <Typography variant="body2" color="textSecondary">
            {ownerData.affiliation}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProjectOwnerSection;

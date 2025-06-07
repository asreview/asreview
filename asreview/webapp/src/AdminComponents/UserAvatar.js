import React from "react";
import { Avatar } from "@mui/material";
import { getInitials } from "utils/userUtils";

const UserAvatar = ({ user, isOwner = false, isPending = false, ...props }) => {
  const getBgColor = () => {
    if (isOwner) return "primary.main";
    if (isPending) return "warning.main";
    return "secondary.main";
  };

  return (
    <Avatar sx={{ bgcolor: getBgColor() }} {...props}>
      {getInitials(user.name)}
    </Avatar>
  );
};

export default UserAvatar;

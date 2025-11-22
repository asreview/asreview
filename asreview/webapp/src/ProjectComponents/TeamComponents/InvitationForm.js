import { Card, CardHeader, CardContent, Typography } from "@mui/material";
import * as React from "react";

const InvitationForm = ({ project_id }) => {
  return (
    <Card>
      <CardHeader
        title="Invite team members"
        subheader="Create a crowd of experts to screen this project together"
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          Link-based invitation system coming soon...
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InvitationForm;

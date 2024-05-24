import * as React from "react";
import { Box, Card, CardContent, List, Typography } from "@mui/material";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";
import UserListEntry from "./UserListEntry";

const UserListComponent = ({header, users}) => {
  return (
    <Card className="team-card" elevation={2}>
      <CardContent className="team-card-content">

        <TypographySubtitle1Medium>{header}</TypographySubtitle1Medium>

        <Box sx={{fontStyle: 'italic', fontSize: 13}}>(Double click to remove)</Box>

        <List sx={{ pt: 0 }}>
          {users.map((user) => (
            <UserListEntry
              key={user.id}
              user={user}
              //onDoubleClick={}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
  
export default UserListComponent;

  
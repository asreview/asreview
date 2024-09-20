import * as React from "react";
import { Card, CardContent, List } from "@mui/material";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";
import { UserListEntry } from "ProjectComponents/TeamComponents";

const UserListComponent = ({ header, users, onDelete, disabled = false }) => {
  return (
    <Card>
      <CardContent>
        <TypographySubtitle1Medium>{header}</TypographySubtitle1Medium>
        <List sx={{ pt: 0 }}>
          {users.map((user) => (
            <UserListEntry
              key={user.id}
              user={user}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default UserListComponent;

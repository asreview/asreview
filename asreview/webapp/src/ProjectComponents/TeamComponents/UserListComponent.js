import * as React from "react";
import { Card, CardContent, List } from "@mui/material";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";
import UserListEntry from "./UserListEntry";

const UserListComponent = (props) => {

  return (
    <Card className="team-card" elevation={2}>
      <CardContent class="team-card-content">

        <TypographySubtitle1Medium>{props.header}</TypographySubtitle1Medium>

        <List sx={{ pt: 0 }}>
          {props.users.map((user) => (
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

  
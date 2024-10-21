import { Card, CardContent, CardHeader, List } from "@mui/material";
import { UserListEntry } from "ProjectComponents/TeamComponents";

const UserListComponent = ({ header, users, onDelete, disabled = false }) => {
  return (
    <Card>
      <CardHeader title={header} />
      <CardContent>
        <List>
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

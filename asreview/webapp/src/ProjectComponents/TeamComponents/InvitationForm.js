import { Add } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2 as Grid,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import * as React from "react";

const InvitationForm = ({ selectableUsers, onInvite }) => {
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Card>
      <CardHeader
        title={"Invite people to collaborate"}
        subheader={
          "Invite people to collaborate on this project. They will receive a message with an invitation to join."
        }
      />
      <CardContent>
        <Grid
          container
          spacing={2}
          sx={{ marginTop: 0.5 }}
          alignItems={"center"}
        >
          <Grid
            size={{
              xs: 12,
              sm: 10,
            }}
          >
            <Autocomplete
              id="select-potential-collaborators"
              value={selectedUser}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue = null) => {
                if (newValue !== null) {
                  setSelectedUser(newValue);
                }
              }}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              options={selectableUsers}
              getOptionLabel={(option) => `${option.name}`}
              sx={{ width: "100%" }}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select a user" />
              )}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <Button
              onClick={() => {
                onInvite(selectedUser);
              }}
              startIcon={<Add />}
              disabled={selectedUser == null}
            >
              Invite
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvitationForm;

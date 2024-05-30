import * as React from "react";
import { Add } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Card, CardContent, Fab, Grid } from "@mui/material";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

const InvitationForm = ({ selectableUsers, onInvite }) => {
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Card className="team-card" elevation={2}>
      <CardContent className="team-card-content">
        <TypographySubtitle1Medium>
          Invite people to collaborate
        </TypographySubtitle1Medium>

        <Grid
          container
          spacing={2}
          sx={{ marginTop: 0.5 }}
          alignItems={"center"}
        >
          <Grid item xs={12} sm={10}>
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

          <Grid item xs={12} sm={2}>
            <Fab
              size="medium"
              color="primary"
              onClick={() => {
                if (selectedUser != null) {
                  setSelectedUser(null);
                  onInvite(selectedUser);
                }
              }}
              variant="extended"
              sx={{ width: "100%" }}
            >
              <Add sx={{ mr: 1 }} />
              Invite
            </Fab>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvitationForm;

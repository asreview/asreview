import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2 as Grid,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { TeamAPI } from "api";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

const InvitationForm = ({ project_id }) => {
  const queryClient = useQueryClient();

  const [formState, setFormState] = React.useState({
    selectedUser: null,
    inputValue: "",
  });

  const [snackbarState, setSnackbarState] = React.useState({
    open: false,
    message: "",
  });

  const { data, isLoading } = useQuery(
    ["fetchUsers", project_id],
    TeamAPI.fetchUsers,
  );

  const { mutate, isLoading: isLoadingInvitation } = useMutation(
    TeamAPI.inviteUser,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchUsers", project_id]);
        setSnackbarState({ open: true, message: "Invitation sent" });
      },
      onError: () => {
        setSnackbarState({
          open: true,
          message: "Unable to invite the selected user",
        });
      },
    },
  );

  return (
    <Card>
      <CardHeader
        title={"Invite team members"}
        subheader={"Create a crowd of experts to screen this project together"}
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
              value={formState.selectedUser}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue = null) => {
                setFormState((prevState) => ({
                  ...prevState,
                  selectedUser: newValue,
                }));
              }}
              inputValue={formState.inputValue}
              onInputChange={(event, newInputValue) => {
                setFormState((prevState) => ({
                  ...prevState,
                  inputValue: newInputValue,
                }));
              }}
              options={data?.filter((user) => user.selectable)}
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
              loading={isLoading}
              noOptionsText="No users found"
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
                mutate({
                  projectId: project_id,
                  userId: formState.selectedUser.id,
                });
                setFormState({ selectedUser: null, inputValue: "" });
              }}
              disabled={
                isLoading || isLoadingInvitation || !formState.selectedUser
              }
              loading={isLoadingInvitation}
            >
              Invite
            </Button>
          </Grid>
        </Grid>
      </CardContent>
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbarState({ open: false, message: "" });
        }}
        message={snackbarState.message}
      />
    </Card>
  );
};

export default InvitationForm;

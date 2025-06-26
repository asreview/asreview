import React from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { TeamAPI } from "api";
import { getUserDisplayName } from "utils/userUtils";

const UserSelector = ({
  projectId,
  value,
  onChange,
  label = "Select a user",
  excludeOwner = false,
  excludeMembers = false,
  disabled = false,
  placeholder = "Type to search users...",
  ...autocompleteProps
}) => {
  const { data: projectUsers, isLoading: isLoadingProjectUsers } = useQuery(
    ["fetchProjectUsers", projectId],
    TeamAPI.fetchUsers,
    {
      enabled: Boolean(projectId && (excludeOwner || excludeMembers)),
    },
  );

  const { data: allUsers, isLoading: isLoadingAllUsers } = useQuery(
    ["fetchAdminUsers"],
    () =>
      fetch(`${window.api_url}admin/users`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => data.users),
    {
      enabled: Boolean(projectId),
    },
  );

  const isLoading = isLoadingProjectUsers || isLoadingAllUsers;

  // Filter users based on exclusion criteria
  const filteredUsers = React.useMemo(() => {
    if (!allUsers) return [];

    let availableUsers = [...allUsers];

    if (projectUsers && (excludeOwner || excludeMembers)) {
      const excludedUserIds = new Set();

      projectUsers.forEach((user) => {
        if (excludeOwner && user.owner) {
          excludedUserIds.add(user.id);
        }
        if (excludeMembers && user.member && !user.owner) {
          excludedUserIds.add(user.id);
        }
      });

      availableUsers = availableUsers.filter(
        (user) => !excludedUserIds.has(user.id),
      );
    }

    return availableUsers;
  }, [allUsers, projectUsers, excludeOwner, excludeMembers]);

  return (
    <Autocomplete
      value={value}
      onChange={onChange}
      options={filteredUsers}
      getOptionLabel={(option) => getUserDisplayName(option)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      loading={isLoading}
      disabled={disabled || isLoading}
      noOptionsText="No available users found"
      PaperComponent={({ children, ...props }) => (
        <div
          {...props}
          style={{
            ...props.style,
            backgroundColor: "white",
            border: "1px solid rgba(0, 0, 0, 0.23)",
            borderRadius: "4px",
            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
            marginTop: "4px",
          }}
        >
          {children}
        </div>
      )}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.id}
          style={{
            ...props.style,
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <div>
            <Typography variant="body1">
              {getUserDisplayName(option)}
            </Typography>
            {option.email && (
              <Typography variant="body2" color="textSecondary">
                {option.email}
              </Typography>
            )}
            {option.affiliation && (
              <Typography variant="caption" color="textSecondary">
                {option.affiliation}
              </Typography>
            )}
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
        />
      )}
      {...autocompleteProps}
    />
  );
};

export default UserSelector;

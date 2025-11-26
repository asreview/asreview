import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText as FHT,
  FormControl,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  OutlinedInput,
  InputLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { InlineErrorHandler } from "Components";
import { useToggle } from "hooks/useToggle";

import { AuthAPI } from "api";
import { useFormik } from "formik";
import {
  emailValidation,
  passwordRequirements,
  passwordValidation,
} from "globals.js";
import * as Yup from "yup";

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
  email: emailValidation(Yup.string())
    .nullable()
    .when("$window.allowAccountCreation", {
      is: true,
      then: (schema) => schema.required("Email is required"),
      otherwise: (schema) => schema.optional(),
    }),
  name: Yup.string().required("Full name is required").nullable(),
  affiliation: Yup.string(),
  oldPassword: Yup.string(),
  newPassword: passwordValidation(Yup.string()),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .when("newPassword", {
      is: (value) => value !== undefined && value.length > 0,
      then: (schema) => schema.required("Confirmation password is required"),
    }),
});

const ProfilePage = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [initEmail, setInitEmail] = React.useState(null);
  const [initName, setInitName] = React.useState(null);
  const [initAffiliation, setInitAffiliation] = React.useState(null);

  const [showPassword, toggleShowPassword] = useToggle();
  const [loadingSaveButton, setLoadingSaveButton] = React.useState(true);
  const [showPasswordFields, setShowPasswordFields] = React.useState(false);
  const [searchParams] = useSearchParams();
  const showFirstTimeMessage = searchParams.get("first_time");
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState(null);

  // Hide delete button for new OAuth users completing their profile
  const shouldHideDeleteButton =
    window.oAuthData !== "false" && showFirstTimeMessage;

  const { error, isError, mutate } = useMutation(AuthAPI.updateProfile, {
    onSuccess: (data) => {
      if (data.email_changed && data.user_id) {
        AuthAPI.signout().then(() => {
          queryClient.invalidateQueries();
          navigate(`/confirm_account?user_id=${data.user_id}`);
        });
      } else {
        navigate("/reviews");
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const { mutate: deleteAccount } = useMutation(AuthAPI.deleteAccount, {
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/signin");
    },
    onError: (err) => {
      setDeleteError(err.message);
      handleCloseDeleteDialog();
    },
  });

  const handleClickOpenDeleteDialog = () => {
    setDeleteError(null);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteAccount = () => {
    deleteAccount();
  };

  const handleSubmit = () => {
    if (formik.isValid) {
      mutate({
        ...formik.values,
        oldPassword: formik.values.oldPassword || "",
        newPassword: formik.values.newPassword || "",
      });
    }
  };

  const handleReset = () => {
    formik.setValues({
      name: initName,
      email: initEmail,
      affiliation: initAffiliation,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const initialValues = {
    email: "",
    name: "",
    affiliation: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignupSchema,
  });

  const { data, isFetched } = useQuery("fetchProfileData", AuthAPI.getProfile, {
    onSuccess: (data) => {
      var email = data.message.email;
      var name = data.message.name;
      var affiliation = data.message.affiliation || "";

      setInitEmail(email);
      setInitName(name);
      setInitAffiliation(affiliation);

      formik.setValues(
        {
          name: name,
          email: email,
          affiliation: affiliation,
        },
        true,
      );

      if (data.message.origin === "asreview") {
        setShowPasswordFields(true);
      } else {
        setShowPasswordFields(false);
      }
      // stop spinner in button
      setLoadingSaveButton(false);
    },
    onError: (err) => {
      console.log("Did not fetch profile data from backend", err);
    },
  });

  const oldPasswordHasValue = () => {
    return (
      formik.values.oldPassword === undefined ||
      formik.values.oldPassword === ""
    );
  };

  const passwordFieldOpacity = () => {
    if (oldPasswordHasValue()) {
      return 0.3;
    } else {
      return 1;
    }
  };

  const renderPasswordFields = (formik) => {
    return (
      <>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6">Email & password</Typography>
          <FormControl>
            <TextField
              required={false}
              id="email"
              label="Email"
              size="small"
              fullWidth
              value={formik.values.email}
              slotProps={{
                readOnly: true,
                formHelperText: {
                  sx: { textAlign: "right" },
                },
              }}
              helperText="Contact your ASReview LAB administrator to change your email address"
            />
            {formik.touched.email && formik.errors.email ? (
              <FHT error={true}>{formik.errors.email}</FHT>
            ) : null}
          </FormControl>

          <FormControl variant="outlined">
            <InputLabel htmlFor="oldPassword">Old Password</InputLabel>
            <OutlinedInput
              id="oldPassword"
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={toggleShowPassword}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseUp={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Old Password"
              value={formik.values.oldPassword}
              onChange={formik.handleChange}
            />
          </FormControl>

          <FormControl
            variant="outlined"
            style={{ opacity: passwordFieldOpacity() }}
          >
            <InputLabel htmlFor="newPassword">New Password</InputLabel>
            <OutlinedInput
              id="newPassword"
              type={showPassword ? "text" : "password"}
              disabled={oldPasswordHasValue()}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={toggleShowPassword}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseUp={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="New Password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
            />
          </FormControl>

          <FormControl
            variant="outlined"
            style={{ opacity: passwordFieldOpacity() }}
          >
            <InputLabel htmlFor="confirmPassword">
              Confirm New Password
            </InputLabel>
            <OutlinedInput
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              disabled={oldPasswordHasValue()}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={toggleShowPassword}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseUp={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm New Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
            />
          </FormControl>
        </Stack>
        <Typography variant="body2" sx={{ marginTop: "7px !important" }}>
          {passwordRequirements}
        </Typography>
        {formik.touched.newPassword && formik.errors.newPassword ? (
          <FHT error={true}>{formik.errors.newPassword}</FHT>
        ) : null}
        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
          <FHT error={true}>{formik.errors.confirmPassword}</FHT>
        ) : null}
      </>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Profile
      </Typography>

      {data && isFetched && (
        <>
          {/* Page body */}
          <Stack direction={"column"} spacing={3}>
            {showFirstTimeMessage && (
              <Typography variant="h6">
                Please take a moment to review your profile data:
              </Typography>
            )}
            <TextField
              required={true}
              id="name"
              label="Full name"
              size="small"
              fullWidth
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
            />
            {formik.touched.name && formik.errors.name ? (
              <FHT error={true}>{formik.errors.name}</FHT>
            ) : null}
            <TextField
              id="affiliation"
              label="Affiliation"
              size="small"
              fullWidth
              value={formik.values.affiliation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
            />
            {formik.touched.affiliation && formik.errors.affiliation ? (
              <FHT error={true}>{formik.errors.affiliation}</FHT>
            ) : null}
            {showPasswordFields && renderPasswordFields(formik)}

            {isError && (
              <FHT>
                <InlineErrorHandler message={error.message} />
              </FHT>
            )}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button
              id="save"
              disabled={!formik.isValid || loadingSaveButton}
              variant="contained"
              onClick={handleSubmit}
            >
              Save
            </Button>
            <Button onClick={handleReset} sx={{ marginRight: "15px" }}>
              Reset
            </Button>
          </Stack>

          {!shouldHideDeleteButton && (
            <Stack spacing={1} sx={{ mt: 4 }}>
              <Typography variant="h6">Delete account</Typography>
              <Typography variant="body2" color="text.secondary">
                Once you delete your account, there is no going back. Please be
                certain.
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleClickOpenDeleteDialog}
                sx={{ width: "fit-content" }}
              >
                Delete your account
              </Button>
              {deleteError && (
                <FHT>
                  <InlineErrorHandler message={deleteError} />
                </FHT>
              )}
            </Stack>
          )}

          <Dialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Delete your account?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
              <Button onClick={handleDeleteAccount} color="error" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default ProfilePage;

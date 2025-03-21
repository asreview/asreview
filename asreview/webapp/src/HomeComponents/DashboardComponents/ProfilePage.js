import {
  Button,
  Checkbox,
  Container,
  FormHelperText as FHT,
  FormControl,
  FormControlLabel,
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
import { passwordRequirements, passwordValidation } from "globals.js";
import * as Yup from "yup";

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
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
  const [initPublic, setInitPublic] = React.useState(true);

  const [showPassword, toggleShowPassword] = useToggle();
  const [loadingSaveButton, setLoadingSaveButton] = React.useState(true);
  const [showPasswordFields, setShowPasswordFields] = React.useState(false);
  const [searchParams] = useSearchParams();
  const showFirstTimeMessage = searchParams.get("first_time");

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
      publicAccount: initPublic,
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
    publicAccount: true,
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
      var publicAcc = data.message.public || true;

      setInitEmail(email);
      setInitName(name);
      setInitAffiliation(affiliation);
      setInitPublic(publicAcc);

      formik.setValues(
        {
          name: name,
          email: email,
          affiliation: affiliation,
          publicAccount: publicAcc,
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
          <Typography variant="h6">Change email & password</Typography>
          <FormControl>
            <TextField
              required={true}
              id="email"
              label="Email"
              size="small"
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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

            {false && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      id="publicAccount"
                      defaultChecked={formik.values.publicAccount}
                      value={formik.values.publicAccount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  }
                  label="Make this account public"
                />
                <FHT>Making this account public allows you to collaborate.</FHT>
              </>
            )}
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
              reset
            </Button>
          </Stack>
        </>
      )}
    </Container>
  );
};

export default ProfilePage;

import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText as FHT,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import { TypographyH5Medium } from "StyledComponents/StyledTypography";
import { InlineErrorHandler } from "Components";
import { useToggle } from "hooks/useToggle";

import { AuthAPI } from "api";
import { passwordRequirements, passwordValidation } from "globals.js";
import { useFormik } from "formik";
import * as Yup from "yup";

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required")
    .nullable(),
  name: Yup.string().required("Full name is required").nullable(),
  affiliation: Yup.string()
    .min(2, "Affiliation must be at least 2 characters long")
    .required("Affiliation is required"),
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
    onSuccess: () => {
      navigate("/projects");
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const handleSubmit = () => {
    if (formik.isValid) {
      mutate(formik.values);
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

      // show password field?
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

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

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
        <FormControl>
          <Stack direction="column" spacing={2}>
            <Typography variant="h6">Change email & password</Typography>
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
            <TextField
              id="oldPassword"
              label="Old Password"
              size="small"
              fullWidth
              type={returnType()}
              value={formik.values.oldPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{
                autoComplete: "off",
              }}
            />
            <TextField
              id="newPassword"
              label="New Password"
              size="small"
              fullWidth
              type={returnType()}
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              style={{ opacity: passwordFieldOpacity() }}
              disabled={oldPasswordHasValue()}
              inputProps={{
                autoComplete: "new-password",
              }}
            />
            <TextField
              id="confirmPassword"
              label="Confirm New Password"
              size="small"
              fullWidth
              type={returnType()}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              style={{ opacity: passwordFieldOpacity() }}
              disabled={oldPasswordHasValue()}
              inputProps={{
                autoComplete: "new-password",
              }}
            />
          </Stack>
        </FormControl>

        <Typography variant="body2" sx={{ marginTop: "7px !important" }}>
          {passwordRequirements}
        </Typography>

        {formik.touched.newPassword && formik.errors.newPassword ? (
          <FHT error={true}>{formik.errors.newPassword}</FHT>
        ) : null}
        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
          <FHT error={true}>{formik.errors.confirmPassword}</FHT>
        ) : null}
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                id="public"
                color="primary"
                onChange={toggleShowPassword}
              />
            }
            label="Show passwords"
          />
        </FormControl>
        <Divider />
      </>
    );
  };

  return (
    <>
      {data && isFetched && (
        <>
          {/* Header */}
          <Box
            className="main-page-sticky-header-wrapper"
            sx={{ background: (theme) => theme.palette.background.paper }}
          >
            <Box className="main-page-sticky-header with-button">
              {!props.mobileScreen && (
                <TypographyH5Medium>Profile</TypographyH5Medium>
              )}
              {props.mobileScreen && (
                <Typography variant="h6">Profile</Typography>
              )}
              <Stack direction="row" spacing={1}>
                <span>
                  <Button onClick={handleReset} sx={{ marginRight: "15px" }}>
                    reset
                  </Button>
                  <LoadingButton
                    id="save"
                    disabled={!formik.isValid}
                    loading={loadingSaveButton}
                    variant="contained"
                    onClick={handleSubmit}
                    size={!props.mobileScreen ? "medium" : "small"}
                  >
                    Save
                  </LoadingButton>
                </span>
              </Stack>
            </Box>
          </Box>

          {/* Page body */}
          <Box className="main-page-body-wrapper">
            <Stack className="main-page-body" direction={"column"} spacing={3}>
              {showFirstTimeMessage && (
                <Typography variant="h6">
                  Please take a second to review your profile data:
                </Typography>
              )}
              {!showFirstTimeMessage && (
                <Typography variant="h6">User data</Typography>
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
                inputProps={{
                  autoComplete: "off",
                }}
              />
              {formik.touched.name && formik.errors.name ? (
                <FHT error={true}>{formik.errors.name}</FHT>
              ) : null}
              <TextField
                required={true}
                id="affiliation"
                label="Affiliation"
                size="small"
                fullWidth
                value={formik.values.affiliation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{
                  autoComplete: "off",
                }}
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
                  <FHT>
                    Making this account public allows you to collaborate.
                  </FHT>
                </>
              )}
              {isError && (
                <FHT>
                  <InlineErrorHandler message={error.message} />
                </FHT>
              )}
            </Stack>
          </Box>
        </>
      )}
    </>
  );
};

export default ProfilePage;

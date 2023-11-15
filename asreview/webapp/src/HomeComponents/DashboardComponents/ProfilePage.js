import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import DashboardPage from "./DashboardPage";
import {
  Box,
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
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";
import { InlineErrorHandler } from "../../Components";
import { useToggle } from "../../hooks/useToggle";

import { AuthAPI } from "../../api";
import { passwordValidation } from "../../globals";
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
    .nullable(),
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
      formik.setFieldValue("email", data.message.email, true);
      formik.setFieldValue("name", data.message.name, true);
      formik.setFieldValue(
        "affiliation",
        data.message.affiliation || "",
        false
      );
      formik.setFieldValue("public", data.message.public || true);
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
        <Divider />
        <FormControl>
          <Stack direction="column" spacing={2}>
            <Typography variant="h6">Change Password</Typography>
            <TextField
              id="oldPassword"
              label="Old Password"
              size="small"
              fullWidth
              type={returnType()}
              value={formik.values.oldPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
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
            />
          </Stack>
        </FormControl>
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
      </>
    );
  };

  return (
    <DashboardPage>
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
                autoFocus
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
                id="name"
                label="Full name"
                size="small"
                fullWidth
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
    </DashboardPage>
  );
};

export default ProfilePage;

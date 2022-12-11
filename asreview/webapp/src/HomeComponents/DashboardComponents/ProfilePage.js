import React from "react";
import DashboardPage from "./DashboardPage";
import {
  Box, 
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText as FHT,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import LoadingButton from "@mui/lab/LoadingButton";
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";
import { useToggle } from "../../hooks/useToggle";

import { AuthAPI } from "../../api";
import { useFormik, resetForm } from 'formik';
import * as Yup from 'yup';

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  name: Yup.string()
    .required('Full name is required'),
  affiliation: Yup.string()
    .min(2, 'Affiliation must be at least 2 characters long')
    .required('Affiliation is required'),
  password: Yup.string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Use 8 or more characters with a mix of letters, numbers & symbols'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

const Root = styled("div")(({ theme }) => ({}));

const ProfilePage = (props) => {

  const [showPassword, toggleShowPassword] = useToggle();
  const [loadingSaveButton, setLoadingSaveButton] = useToggle(true);
  const [disableSaveButton, setDisabledSavweButton] = useToggle(true);

  const initialValues = {
    email: '',
    name: '',
    affiliation: '',
    password: '',
    confirmPassword: '',
    publicAccount: true
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignupSchema,
  });

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };



  return (
    <DashboardPage>
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
            <Tooltip>
              <span>
                <LoadingButton
                  disabled={disableSaveButton}
                  loading={loadingSaveButton}
                  variant="contained"
                  onClick={true}
                  size={!props.mobileScreen ? "medium" : "small"}
                >
                  Save
                </LoadingButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {/* Page body */}
      <Box className="main-page-body-wrapper">
        <Stack
          className="main-page-body"
          direction={"column"}
          spacing={3}
        >

          <TextField
            id="email"
            label="Email"
            size="small"
            fullWidth
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email ? <FHT error={true}>{formik.errors.email}</FHT> : null}
          <TextField
            id="name"
            label="Full name"
            size="small"
            fullWidth
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name ? <FHT error={true}>{formik.errors.name}</FHT> : null}
          <TextField
            id="affiliation"
            label="Affiliation"
            size="small"
            fullWidth
            value={formik.values.affiliation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.affiliation && formik.errors.affiliation ? <FHT error={true}>{formik.errors.affiliation}</FHT> : null}
          <FormControl>
            <Stack direction="row" spacing={2}>
              <TextField
                id="password"
                label="Password"
                size="small"
                fullWidth
                type={returnType()}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                id="confirmPassword"
                label="Confirm Password"
                size="small"
                fullWidth
                type={returnType()}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Stack>
          </FormControl>
          {formik.touched.password && formik.errors.password ? <FHT error={true}>{formik.errors.password}</FHT> : null}
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? <FHT error={true}>{formik.errors.confirmPassword}</FHT> : null}
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  id="public"
                  color="primary"
                  onChange={toggleShowPassword}
                />
              }
              label="Show password"
            />
            { false && 
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
            }
          </FormControl>
          {/*isError && <InlineErrorHandler message={error.message} />*/}

        </Stack>
      </Box>





    </DashboardPage>
  );
};

export default ProfilePage;

import React from "react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import DashboardPage from "./DashboardPage";
import {
  Box, 
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText as FHT,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import { 
  TypographyH5Medium,
  TypographyH6Medium 
} from "../../StyledComponents/StyledTypography.js";
import { InlineErrorHandler } from "../../Components";
import { useToggle } from "../../hooks/useToggle";

import { AuthAPI } from "../../api";
import { useFormik } from 'formik';
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
    .nullable(),
  password: Yup.string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Use 8 or more characters with a mix of letters, numbers & symbols'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

const ProfilePage = (props) => {
  const navigate = useNavigate();

  const [showPassword, toggleShowPassword] = useToggle();
  const [loadingSaveButton, setLoadingSaveButton] = React.useState(true);
  const [showPasswordFields, setShowPasswordFields] = React.useState(false);
  const [searchParams] = useSearchParams();
  const showFirstTimeMessage = searchParams.get('first_time');

  const { error, isError, mutate } = useMutation(
    AuthAPI.updateProfile,
      {
        onSuccess: () => {
          navigate('/projects');
        },
      }
  );

  const handleSubmit = () => {
    if (formik.isValid) {
      mutate(formik.values);
    }
  }

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

  const {data,  isFetched} = useQuery(
      "fetchProfileData",
      AuthAPI.getProfile,
      {
        onSuccess: (data) => {
          formik.setFieldValue('email', data.message.email, true);
          formik.setFieldValue('name', data.message.name, true);
          formik.setFieldValue('affiliation', data.message.affiliation || '', false);
          formik.setFieldValue('public', data.message.public || true);
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
          console.log('Did not fetch profile data from backend', err)
        }
      }
  )

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

  const renderPasswordFields = (formik) => {
    return (
      <>
        <FormControl>
          <Stack direction="row" spacing={2}>
            <TextField
              id="password"
              label="Change Password"
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
        </FormControl>
      </>
    );
  }

  return (
    <DashboardPage>
    { data && isFetched &&
      <>
        { console.log('hallo')}
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
                  /*disabled={!formik.isValid}*/
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
          <Stack
            className="main-page-body"
            direction={"column"}
            spacing={3}

          >
            { showFirstTimeMessage && 
              <TypographyH6Medium>Please take a second to review your profile data:</TypographyH6Medium>
            }
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
            {showPasswordFields && renderPasswordFields(formik) }
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
            {isError && <FHT><InlineErrorHandler message={error.message} /></FHT>}
          </Stack>
        </Box>
      </>
    }
    </DashboardPage>
  );
};

export default ProfilePage;

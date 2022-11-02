import React from 'react';
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Fade,
  FormControl,
  FormControlLabel,
  FormHelperText as FHT,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { WordmarkState } from "../globals";
import { styled } from "@mui/material/styles";
import { HelpPrivacyTermsButton } from "../Components";
import { FormatLineSpacing } from '@mui/icons-material';
import { useToggle } from "../hooks/useToggle";
import BaseAPI from "../api/AuthAPI";
import { useFormik } from 'formik';
import * as Yup from 'yup';

const PREFIX = "SignUpForm";

const classes = {
  button: `${PREFIX}-button`,
  card: `${PREFIX}-card`,
  cardContent: `${PREFIX}-card-content`,
  logo: `${PREFIX}-logo`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  [`& .${classes.button}`]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    justifyContent: "space-between",
  },

  [`& .${classes.card}`]: {
    borderRadius: theme.spacing(2),
    width: "500px",
  },

  [`& .${classes.cardContent}`]: {
    padding: "48px 40px !important",
  },

  [`& .${classes.logo}`]: {
    width: "100%",
    maxWidth: "130px",
  },
}));

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
  userName: Yup.string()
    .matches(
      /^[a-zA-Z0-9_]{3,20}$/,
      'Sorry, your username must be between 3 and 20 characters long and only contain letters (a-z), numbers (0-9), and underscores (_)'
    )
    .required('Required'),
  affiliation: Yup.string()
    .min(2, 'Affiliation must be at least 2 characters long')
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Use 8 or more characters with a mix of letters, numbers & symbols'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
     .oneOf([Yup.ref('password'), null], 'Passwords must match')
});




const SignUpForm = (props) => {
  // Pass the useFormik() hook initial form values, a validate function that will be called when
  // form values change or fields are blurred, and a submit function that will
  // be called when the form is submitted
  const navigate = useNavigate();

  const [showPassword, toggleShowPassword] = useToggle();

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

  const formik = useFormik({
    initialValues: {
      userName: '',
      firstName: '',
      lastName: '',
      affiliation: '',
      email: '',
      password: '',
      confirmPassword: '',
      publicAccount: true
    },
    validationSchema: SignupSchema,
  });

  const { error, isError, isLoading, mutate, reset } = useMutation(
    BaseAPI.signup,
    {
      onSuccess: () => {
        // setUsername("");
        // setFirstName("");
        // setLastName("");
        // setAffiliation("");
        // setEmail("");
        // setPassword("");
        // setConfirmPassword("");
        // setPublicAccount("");
        // navigate("/signin");
      },
    }
  );

  const handleSubmit = () => {
    console.log('Hello');
    mutate(formik.values);
  }

  const handleSignIn = () => {
    navigate("/signin");
  };

  return (
    <Root>
      <Fade in>
        <Box> 
          <Card className={classes.card} variant="outlined">
            <CardContent className={classes.cardContent}>
              <Stack spacing={3}>
                <img
                  className={classes.logo}
                  src={WordmarkState()}
                  alt="ASReview LAB"
                />
                <Typography variant="h5">Create your profile</Typography>
                <Stack
                  spacing={3}
                  component="form"
                  noValidate
                  autoComplete="off"
                >
                <TextField
                  id="userName"
                  label="Username"
                  size="small"
                  fullWidth
                  autoFocus
                  value={formik.values.userName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.userName && formik.errors.userName ? <FHT error={true}>{formik.errors.userName}</FHT> : null}
                <FormControl>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      id="firstName"
                      label="First name"
                      size="small"
                      fullWidth
                      value={formik.values.firstName}
                    />
                    <TextField
                      id="lastName"
                      label="Last name"
                      size="small"
                      fullWidth
                      value={formik.values.lastName}
                    />
                  </Stack>
                </FormControl>
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        defaultChecked={formik.values.publicAccount}
                        value={formik.values.publicAccount}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Make this account public"
                  />
                  <FHT>
                    Making this account public allows you to collaborate.
                  </FHT>
                </FormControl>
                <Stack className={classes.button} direction="row">
                  <Button onClick={handleSignIn} sx={{ textTransform: "none" }}>
                    Sign in instead
                  </Button>
                  <LoadingButton
                    //loading={isLoading}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!(formik.isValid && formik.dirty)}
                  >
                    Create
                  </LoadingButton>
                </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <HelpPrivacyTermsButton />
        </Box>
      </Fade>
    </Root>
  );
};

export default SignUpForm;

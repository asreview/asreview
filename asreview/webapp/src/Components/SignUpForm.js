import React from "react";
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
  Divider,
} from "@mui/material";

import { InlineErrorHandler } from ".";
import {
  WordmarkState,
  passwordRequirements,
  passwordValidation,
} from "globals.js";
import { styled } from "@mui/material/styles";
import { HelpPrivacyTermsButton } from "Components";
import { useToggle } from "hooks/useToggle";
import BaseAPI from "api/AuthAPI";
import { useFormik } from "formik";
import * as Yup from "yup";

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
  email: Yup.string().email("Invalid email").required("Email is required"),
  name: Yup.string().required("Full name is required"),
  affiliation: Yup.string()
    .min(2, "Affiliation must be at least 2 characters long")
    .required("Affiliation is required"),
  password: passwordValidation(Yup.string()).required("Password is required"),
  confirmPassword: Yup.string()
    .required("Password confirmation is required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const SignUpForm = (props) => {
  // Pass the useFormik() hook initial form values, a validate function that will be called when
  // form values change or fields are blurred, and a submit function that will
  // be called when the form is submitted
  const navigate = useNavigate();

  const [showPassword, toggleShowPassword] = useToggle(false);

  const initialValues = {
    email: "",
    name: "",
    affiliation: "",
    password: "",
    confirmPassword: "",
    publicAccount: true,
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignupSchema,
  });

  const { error, isError, mutate } = useMutation(BaseAPI.signup, {
    onSuccess: () => {
      let email = formik.values.email;
      formik.setValues(initialValues, false);
      if (typeof props.showNotification === "function") {
        props.showNotification(
          `A confirmation email has been sent to ${email}.`,
        );
      }
      navigate("/signin");
    },
  });

  const handleSubmit = () => {
    if (formik.isValid) {
      mutate(formik.values);
    }
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleEnterKey = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
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
                <Stack spacing={3} component="form" noValidate>
                  <TextField
                    required={true}
                    id="email"
                    name="email"
                    label="Email"
                    size="small"
                    type="email"
                    autoComplete="email"
                    fullWidth
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <FHT error={true}>{formik.errors.email}</FHT>
                  ) : null}
                  <FormControl>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        required={true}
                        id="password"
                        label="Password"
                        size="small"
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        inputProps={{
                          autoComplete: "new-password",
                        }}
                      />
                      <TextField
                        required={true}
                        id="confirmPassword"
                        label="Confirm Password"
                        size="small"
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        onKeyDown={handleEnterKey}
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        inputProps={{
                          autoComplete: "new-password",
                        }}
                      />
                    </Stack>
                  </FormControl>

                  <Typography
                    variant="body2"
                    sx={{ marginTop: "7px !important" }}
                  >
                    {passwordRequirements}
                  </Typography>

                  {formik.touched.password && formik.errors.password ? (
                    <FHT error={true}>{formik.errors.password}</FHT>
                  ) : null}
                  {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword ? (
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
                      label="Show password"
                    />
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
                  </FormControl>
                  {isError && <InlineErrorHandler message={error.message} />}
                  <Divider />
                  <TextField
                    required={true}
                    id="name"
                    name="name"
                    label="Full name"
                    size="small"
                    autoComplete="name"
                    fullWidth
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <FHT error={true}>{formik.errors.name}</FHT>
                  ) : null}
                  <TextField
                    required={true}
                    id="affiliation"
                    label="Affiliation"
                    size="small"
                    name="affiliation"
                    autoComplete="organization"
                    fullWidth
                    value={formik.values.affiliation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.affiliation && formik.errors.affiliation ? (
                    <FHT error={true}>{formik.errors.affiliation}</FHT>
                  ) : null}
                  <Stack className={classes.button} direction="row">
                    <Button
                      id="sign-in"
                      onClick={handleSignIn}
                      sx={{ textTransform: "none" }}
                    >
                      Sign In instead
                    </Button>
                    <LoadingButton
                      //loading={isLoading}
                      id="create-profile"
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

import {
  Button,
  CardActions,
  CardContent,
  Checkbox,
  Divider,
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
  CardHeader,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import BaseAPI from "api/AuthAPI";
import { useFormik } from "formik";
import { passwordRequirements, passwordValidation } from "globals.js";
import { useToggle } from "hooks/useToggle";
import * as Yup from "yup";
import { InlineErrorHandler } from ".";

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  name: Yup.string().required("Full name is required"),
  affiliation: Yup.string(),
  password: passwordValidation(Yup.string()).required("Password is required"),
  confirmPassword: Yup.string()
    .required("Password confirmation is required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const SignUpForm = () => {
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

  const { error, isError, mutate, isLoading } = useMutation(BaseAPI.signup, {
    onSuccess: (data) => {
      // let email = formik.values.email;
      formik.setValues(initialValues, false);
      // if (typeof showNotification === "function") {
      //   showNotification(`A confirmation email has been sent to ${email}.`);
      // }
      if (window.emailVerification) {
        let userId = data.user_id;
        navigate(`/confirm_account?user_id=${userId}`);
      } else {
        navigate("/");
      }
    },
  });

  const handleSubmit = () => {
    if (formik.isValid) {
      mutate(formik.values);
    }
  };

  const handleEnterKey = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <CardHeader title="Create your profile" />
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={2.5} component="form" noValidate>
            <TextField
              required={true}
              id="email"
              name="email"
              label="Email"
              type="email"
              autoComplete="off"
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email ? (
              <FHT error={true}>{formik.errors.email}</FHT>
            ) : null}

            <FormControl variant="outlined">
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
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
                label="Password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </FormControl>

            <FormControl variant="outlined">
              <InputLabel htmlFor="confirmPassword">
                Confirm Password
              </InputLabel>
              <OutlinedInput
                id="confirmPassword"
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
                label="Confirm Password"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onKeyDown={handleEnterKey}
              />
            </FormControl>

            <Typography variant="body2" sx={{ marginTop: "14px !important" }}>
              {passwordRequirements}
            </Typography>

            {formik.touched.password && formik.errors.password ? (
              <FHT error={true}>{formik.errors.password}</FHT>
            ) : null}
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <FHT error={true}>{formik.errors.confirmPassword}</FHT>
            ) : null}
            <FormControl>
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
              id="affiliation"
              label="Affiliation"
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
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button
          id="create-profile"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!(formik.isValid && formik.dirty) || isLoading}
        >
          Create
        </Button>
        <Button
          id="sign-in"
          onClick={() => navigate("/signin")}
          sx={{ textTransform: "none" }}
        >
          Sign In instead
        </Button>
      </CardActions>
    </>
  );
};

export default SignUpForm;

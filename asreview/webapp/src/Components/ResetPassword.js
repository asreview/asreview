import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  FormHelperText as FHT,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { OTPFormField } from "Components";
import AuthAPI from "api/AuthAPI";
import { useFormik } from "formik";
import { passwordRequirements, passwordValidation } from "globals.js";
import { useToggle } from "hooks/useToggle";
import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { InlineErrorHandler } from ".";

// OTP Validation Schema
const OTPValidationSchema = Yup.string()
  .length(6, "OTP must be exactly 6 digits")
  .matches(/^\d{6}$/, "OTP must contain only digits")
  .required("OTP is required");

// PASSWORD Validation Schema
const SignupSchema = Yup.object().shape({
  otp: OTPValidationSchema,
  password: passwordValidation(Yup.string()).required("Password is required"),
  confirmPassword: Yup.string()
    .required("Password confirmation is required")
    .oneOf([Yup.ref("password")], "Passwords must match")
    .when("password", {
      is: (value) => value !== undefined && value.length > 0,
      then: (schema) => schema.required("Confirmation password is required"),
    }),
});

const ResetPassword = () => {
  const queryClient = useQueryClient();
  const [otp, setOtp] = React.useState(new Array(6).fill(""));
  const [showPassword, toggleShowPassword] = useToggle();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [notification, toggleNotification] = useToggle();

  const initialValues = {
    otp: "", // Track OTP as a string in Formik
    password: "",
    confirmPassword: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignupSchema,
    onSubmit: (values) => {
      let userId = searchParams.get("user_id");
      let token = values.otp;
      let password = values.password;

      if (formik.isValid) {
        mutate({ userId, token, password });
      }
    },
  });

  const { mutate } = useMutation(AuthAPI.resetPassword, {
    onMutate: () => {
      queryClient.resetQueries("user");
    },
    onSuccess: () => {
      formik.setValues(initialValues, false);
      navigate("/");
    },
    onError: (data) => {
      setErrorMessage(data.message);
      toggleNotification();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <CardHeader title="Reset your password" />
      <CardContent>
        <Stack spacing={2}>
          <FormControl>
            <Stack spacing={2}>
              <Typography variant="body2">
                You have received a code by email that allows you to reset your
                password. Enter the code below:
              </Typography>

              {/* Pass formik's setFieldValue to OTPFormField */}
              <OTPFormField
                otp={otp}
                onOtpChange={setOtp}
                setFieldValue={formik.setFieldValue}
                setFieldTouched={formik.setFieldTouched}
              />
              {formik.touched.otp && formik.errors.otp && (
                <FHT error>{formik.errors.otp}</FHT>
              )}

              <Typography variant="body2">{passwordRequirements}</Typography>

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
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </FormControl>
            </Stack>
          </FormControl>

          {/* Display validation errors */}
          {formik.touched.password && formik.errors.password && (
            <FHT error>{formik.errors.password}</FHT>
          )}
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <FHT error>{formik.errors.confirmPassword}</FHT>
          )}

          {/* Remove the show password checkbox since we now have the toggle buttons */}
          {errorMessage && <InlineErrorHandler message={errorMessage} />}
        </Stack>
      </CardContent>

      <CardActions>
        <Button
          disabled={!formik.isValid || formik.values.password === ""}
          variant="contained"
          color="primary"
          type="submit"
        >
          Submit
        </Button>
        <Button
          onClick={() => navigate("/signin")}
          sx={{ textTransform: "none" }}
        >
          Sign In instead
        </Button>
      </CardActions>

      <Snackbar
        open={notification}
        autoHideDuration={6000}
        onClose={toggleNotification}
      >
        <Alert
          onClose={toggleNotification}
          severity="error"
          sx={{ width: "100%" }}
          variant="filled"
        >
          Your password has not been reset! Please contact your administrator.
        </Alert>
      </Snackbar>
    </form>
  );
};

export default ResetPassword;

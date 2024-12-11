import {
  Alert,
  Button,
  CardActions,
  CardContent,
  Checkbox,
  FormHelperText as FHT,
  FormControl,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
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
      navigate("/signin");
    },
    onError: (data) => {
      setErrorMessage(data.message);
      toggleNotification();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Reset your password</Typography>
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

              <TextField
                required
                id="password"
                label="Password"
                size="small"
                fullWidth
                variant="outlined"
                type={!showPassword ? "password" : "text"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                required
                id="confirmPassword"
                label="Confirm Password"
                size="small"
                fullWidth
                variant="outlined"
                type={!showPassword ? "password" : "text"}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Stack>
          </FormControl>

          {/* Display validation errors */}
          {formik.touched.password && formik.errors.password && (
            <FHT error>{formik.errors.password}</FHT>
          )}
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <FHT error>{formik.errors.confirmPassword}</FHT>
          )}

          <FormControl>
            <FormControlLabel
              control={
                <Checkbox color="primary" onChange={toggleShowPassword} />
              }
              label="Show password"
            />
          </FormControl>
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

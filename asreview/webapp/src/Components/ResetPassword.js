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
import AuthAPI from "api/AuthAPI";
import { useFormik } from "formik";
import { passwordRequirements, passwordValidation } from "globals.js";
import { useToggle } from "hooks/useToggle";
import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { InlineErrorHandler } from ".";

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
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
  const [showPassword, toggleShowPassword] = useToggle();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState("");

  const [notification, toggleNotification] = useToggle();

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignupSchema,
  });

  const { mutate } = useMutation(AuthAPI.resetPassword, {
    onMutate: () => {
      // clear potential error
      queryClient.resetQueries("refresh");
    },
    onSuccess: (data) => {
      formik.setValues(initialValues, false);
      navigate("/signin");
    },
    onError: (data) => {
      setErrorMessage(data.message);
      toggleNotification();
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    let userId = searchParams.get("user_id");
    let token = searchParams.get("token");
    let password = formik.values.password;

    if (formik.isValid) {
      mutate({ userId, token, password });
    }
  };

  return (
    <>
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography variant="h5">Reset your password</Typography>
            <Typography variant="body2" sx={{ marginTop: "7px !important" }}>
              {passwordRequirements}
            </Typography>
          </Stack>

          <FormControl>
            <Stack spacing={3}>
              <TextField
                required={true}
                id="password"
                label="Password"
                size="small"
                fullWidth
                autoFocus
                variant="outlined"
                type={!showPassword ? "password" : "text"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                slotProps={{
                  htmlInput: {
                    autoComplete: "new-password",
                  },
                }}
              />
              <TextField
                required={true}
                id="confirmPassword"
                label="Confirm Password"
                size="small"
                fullWidth
                variant="outlined"
                type={!showPassword ? "password" : "text"}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                slotProps={{
                  htmlInput: {
                    autoComplete: "new-password",
                  },
                }}
              />
            </Stack>
          </FormControl>
          {formik.touched.password && formik.errors.password ? (
            <FHT error={true}>{formik.errors.password}</FHT>
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
              label="Show password"
            />
          </FormControl>
          {Boolean(errorMessage) && (
            <InlineErrorHandler message={errorMessage} />
          )}
        </Stack>
      </CardContent>

      <CardActions>
        <Button
          disabled={!formik.isValid || formik.values.password === ""}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </CardActions>
      <Snackbar
        open={notification}
        autoHideDuration={6000}
        onClose={toggleNotification}
      >
        <Alert
          onClose={toggleNotification}
          severity={"error"}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {
            "Your password has not been reset! Please contact your administrator"
          }
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResetPassword;

import {
  Alert,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  FormHelperText as FHT,
  FormControl,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { OTPFormField } from "Components";
import AuthAPI from "api/AuthAPI";
import { useFormik } from "formik";
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
});

const ConfirmAccount = () => {
  const queryClient = useQueryClient();
  const [otp, setOtp] = React.useState(new Array(6).fill(""));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [notification, toggleNotification] = useToggle();

  const initialValues = {
    otp: "", // Track OTP as a string in Formik
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

  const { mutate } = useMutation(AuthAPI.confirmAccount, {
    onMutate: () => {
      queryClient.resetQueries("user");
    },
    onSuccess: () => {
      formik.setValues(initialValues, false);
      // if successful, than the user is signed in.
      navigate("/");
    },
    onError: (data) => {
      setErrorMessage(data.message);
      toggleNotification();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <CardHeader title="Confirm your account" />
      <CardContent>
        <Stack spacing={2}>
          <FormControl>
            <Stack spacing={2}>
              <Typography variant="body2">
                You have received a code by email that allows you to confirm
                your account credentials. Enter the code below:
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
            </Stack>
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
          {`Your account is not confirmed! ${errorMessage}`}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default ConfirmAccount;

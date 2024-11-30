import {
  Button,
  CardActions,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import AuthAPI from "api/AuthAPI";

const ForgotPassword = ({ showNotification }) => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");

  const { isLoading, mutate, reset } = useMutation(AuthAPI.forgotPassword, {
    onSuccess: (data) => {
      let userId = data.user_id;
      navigate(`/reset_password?user_id=${userId}`);
    },
    onError: (data) => {
      console.error("Forgot password error", data);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    reset();
    mutate({ email });
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <>
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography variant="h5">Forgot your password?</Typography>
            {window.emailVerification && (
              <p>
                Enter your email address, click on the submit button and an
                email will be sent to you. Check your spam or bulk folder if you
                don't get an email.
              </p>
            )}
            {!window.emailVerification && (
              <p>Contact your ASReview-app administrator</p>
            )}
          </Stack>
          {window.emailVerification && (
            <Stack spacing={3}>
              <TextField
                label="Email"
                value={email}
                onChange={handleEmailChange}
                variant="outlined"
                fullWidth
                autoFocus
              />
            </Stack>
            // {isError && <InlineErrorHandler message={error.message} />}
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2 }}>
        {window.emailVerification && (
          <Button
            disabled={isLoading}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        )}
        <Button
          onClick={() => navigate("/signin")}
          sx={{ textTransform: "none" }}
        >
          Sign In instead
        </Button>
      </CardActions>
    </>
  );
};

export default ForgotPassword;

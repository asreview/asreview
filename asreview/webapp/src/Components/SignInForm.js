import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  CardActions,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ForgotPassword } from "Components";
import * as React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { InlineErrorHandler } from ".";

import AuthAPI from "api/AuthAPI";
import { useToggle } from "hooks/useToggle";

const SignInForm = ({
  allowAccountCreation,
  emailVerification,
  toggleSignUp,
}) => {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [forgotPassword, toggleForgotPassword] = useToggle();

  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [showPassword, toggleShowPassword] = useToggle();

  const { error, isError, isLoading, mutate, reset } = useMutation(
    AuthAPI.signin,
    {
      onSuccess: (data) => {
        if (data.logged_in) {
          setEmail("");
          setPassword("");
          if (from === "/") {
            navigate("/reviews");
          } else {
            navigate(from, { replace: true });
          }
        } else {
          console.error("Backend could not log you in.");
        }
      },
      onError: (data) => {
        console.error("Signin error", data);
      },
    },
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    reset();
    mutate({ email, password });
  };

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

  const handleEnterKey = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  return (
    <>
      {!forgotPassword && (
        <>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h5">Sign in</Typography>
              <TextField
                id="email"
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                fullWidth
                autoFocus
                autoComplete="email"
              />
              <FormControl>
                <TextField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleEnterKey}
                  variant="outlined"
                  fullWidth
                  type={returnType()}
                  autoComplete="current-password"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      id="show-password"
                      checked={showPassword}
                      onChange={toggleShowPassword}
                      value="showPassword"
                      color="primary"
                    />
                  }
                  label="Show password"
                />
              </FormControl>
            </Stack>
            {isError && <InlineErrorHandler message={error.message} />}

            {/* {window.oAuthConfig?.services &&
        Object.keys(window.oAuthConfig.services).length > 0 && (
          <SignInOAuth oAuthConfig={window.oAuthConfig} />
        )} */}
          </CardContent>
          <CardActions sx={{ p: 2 }}>
            <LoadingButton
              id="sign-in"
              loading={isLoading}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Sign in
            </LoadingButton>
            {allowAccountCreation && (
              <Button
                id="create-profile"
                onClick={toggleSignUp}
                sx={{ textTransform: "none" }}
              >
                Create profile
              </Button>
            )}
            <Button
              id="forgot-password"
              onClick={toggleForgotPassword}
              sx={{ textTransform: "none" }}
            >
              Forgot password
            </Button>
          </CardActions>
        </>
      )}
      {forgotPassword && (
        <ForgotPassword toggleForgotPassword={toggleForgotPassword} />
      )}
    </>
  );
};

export default SignInForm;

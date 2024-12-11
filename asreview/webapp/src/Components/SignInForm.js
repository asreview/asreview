import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  CardActions,
  CardContent,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
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

const SignInForm = () => {
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

  // const handleEnterKey = (e) => {
  //   if (e.keyCode === 13) {
  //     handleSubmit(e);
  //   }
  // };

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
              <FormControl sx={{ m: 1 }} variant="outlined">
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
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onMouseUp={(event) => {
                          event.preventDefault();
                        }}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <Button
              id="sign-in"
              disabled={isLoading}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Sign in
            </Button>
            {window.allowAccountCreation && (
              <Button
                id="create-profile"
                onClick={() => navigate("/signup")}
                sx={{ textTransform: "none" }}
              >
                Create profile
              </Button>
            )}
            {window.emailVerification && (
              <Button
                id="forgot-password"
                onClick={() => navigate("/forgot_password")}
                sx={{ textTransform: "none" }}
              >
                Forgot password
              </Button>
            )}
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

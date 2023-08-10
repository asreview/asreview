import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import { InlineErrorHandler } from ".";

import AuthAPI from "../api/AuthAPI";
import useAuth from "../hooks/useAuth";
import { useToggle } from "../hooks/useToggle";

const SignInForm = (props) => {
  const classes = props.classes;
  const allowAccountCreation = props.allowAccountCreation;

  const queryClient = useQueryClient();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [showPassword, toggleShowPassword] = useToggle();

  const { error, isError, isLoading, mutate, reset } = useMutation(
    AuthAPI.signin,
    {
      onMutate: () => {
        // clear potential error
        queryClient.resetQueries("refresh");
      },
      onSuccess: (data) => {
        if (data.logged_in) {
          setAuth({
            logged_in: data.logged_in,
            name: data.name,
            id: data.id,
          });
          setEmail("");
          setPassword("");
          if (from === "/") {
            navigate("/projects");
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

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleForgotPassword = () => {
    navigate("/forgot_password");
  };

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleEnterKey = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          label="Email"
          value={email}
          onChange={handleEmailChange}
          variant="outlined"
          fullWidth
          autoFocus
        />
        <FormControl>
          <TextField
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleEnterKey}
            variant="outlined"
            fullWidth
            type={returnType()}
          />
          <FormControlLabel
            control={
              <Checkbox
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
      <Stack className={classes.button} direction="row">
        {allowAccountCreation && (
          <Button onClick={handleSignUp} sx={{ textTransform: "none" }}>
            Create profile
          </Button>
        )}

        <Button onClick={handleForgotPassword} sx={{ textTransform: "none" }}>
          Forgot password
        </Button>

        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Sign in
        </LoadingButton>
      </Stack>
    </>
  );
};

export default SignInForm;

import * as React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Fade,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from ".";

import ProjectAPI from "../api/ProjectAPI";
import { useToggle } from "../hooks/useToggle";
import { WordmarkState } from "../globals";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PWD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PREFIX = "SignUpForm";

const classes = {
  button: `${PREFIX}-button`,
  card: `${PREFIX}-card`,
  cardContent: `${PREFIX}-card-content`,
  checkbox: `${PREFIX}-checkbox`,
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

const SignUpForm = (props) => {
  const navigate = useNavigate();

  const [username, setUsername] = React.useState("");
  const [validUsername, setValidUsername] = React.useState(false);
  const [usernameFocused, setUsernameFocused] = React.useState(false);

  const [password, setPassword] = React.useState("");
  const [validPassword, setValidPassword] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);

  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [validConfirmPassword, setValidConfirmPassword] = React.useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] =
    React.useState(false);

  const [showPassword, toggleShowPassword] = useToggle();

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateSignUp,
    {
      onSuccess: () => {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      },
    }
  );

  const handleUsernameChange = (e) => {
    reset();
    setUsername(e.target.value);
    setValidUsername(USERNAME_REGEX.test(e.target.value));
  };

  const handlePasswordChange = (e) => {
    reset();
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    reset();
    setConfirmPassword(e.target.value);
  };

  React.useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
    setValidConfirmPassword(confirmPassword === password);
  }, [password, confirmPassword]);

  const handleUsernameFocus = () => {
    setUsernameFocused(true);
  };

  const handleUsernameBlur = () => {
    setUsernameFocused(false);
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
  };

  const handleConfirmPasswordFocus = () => {
    setConfirmPasswordFocused(true);
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordFocused(false);
  };

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

  const returnHelperText = () => {
    if (password && !passwordFocused && !validPassword) {
      return "Sorry, your password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.";
    } else if (
      confirmPassword &&
      !confirmPasswordFocused &&
      !validConfirmPassword
    ) {
      return "Passwords do not match. Try again.";
    } else {
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validUsername && validPassword && validConfirmPassword) {
      mutate({ username, password });
    }
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  return (
    <Root>
      <Fade in>
        <Card className={classes.card} variant="outlined">
          <CardContent className={classes.cardContent}>
            <Stack spacing={3}>
              <img
                className={classes.logo}
                src={WordmarkState()}
                alt="ASReview LAB"
              />
              <Typography variant="h5">Create your profile</Typography>
              <Stack spacing={3} component="form" noValidate autoComplete="off">
                <TextField
                  id="username"
                  label="Username"
                  size="small"
                  fullWidth
                  autoFocus
                  error={username !== "" && !validUsername && !usernameFocused}
                  helperText={
                    username && !validUsername && !usernameFocused
                      ? "Sorry, your username must be between 3 and 20 characters long and only contain letters (a-z), numbers (0-9), and underscores (_)."
                      : "You can use letters, numbers & underscores"
                  }
                  value={username}
                  onChange={handleUsernameChange}
                  onFocus={handleUsernameFocus}
                  onBlur={handleUsernameBlur}
                />
                <FormControl>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      id="password"
                      label="Password"
                      size="small"
                      fullWidth
                      error={
                        password !== "" && !passwordFocused && !validPassword
                      }
                      type={returnType()}
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={handlePasswordFocus}
                      onBlur={handlePasswordBlur}
                    />
                    <TextField
                      id="confirm"
                      label="Confirm"
                      size="small"
                      fullWidth
                      error={
                        confirmPassword !== "" &&
                        !confirmPasswordFocused &&
                        !validConfirmPassword
                      }
                      type={returnType()}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onFocus={handleConfirmPasswordFocus}
                      onBlur={handleConfirmPasswordBlur}
                    />
                  </Stack>
                  <FormHelperText error={returnHelperText() !== null}>
                    {!returnHelperText()
                      ? "Use 8 or more characters with a mix of letters, numbers & symbols"
                      : returnHelperText()}
                  </FormHelperText>
                  <FormControlLabel
                    control={
                      <Checkbox color="primary" onChange={toggleShowPassword} />
                    }
                    label="Show password"
                  />
                </FormControl>
              </Stack>
              {isError && <InlineErrorHandler message={error.message} />}
              <Stack className={classes.button} direction="row">
                <Button onClick={handleSignIn}>Sign in instead</Button>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={
                    !(validUsername && validPassword && validConfirmPassword)
                  }
                >
                  Create
                </LoadingButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Root>
  );
};

export default SignUpForm;

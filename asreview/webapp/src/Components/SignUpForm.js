import * as React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
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

import { HelpPrivacyTermsButton } from "../Components";

import { InlineErrorHandler } from ".";

import BaseAPI from "../api/AuthAPI";
import { useToggle } from "../hooks/useToggle";
import { WordmarkState } from "../globals";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PWD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;;

const PREFIX = "SignUpForm";

const classes = {
  button: `${PREFIX}-button`,
  card: `${PREFIX}-card`,
  cardContent: `${PREFIX}-card-content`,
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

  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [affiliation, setAffiliation] = React.useState("")
  
  const [email, setEmail] = React.useState("")
  const [validEmail, setValidEmail] = React.useState(false)
  const [emailFocused, setEmailFocused] = React.useState(false)

  const [password, setPassword] = React.useState("");
  const [validPassword, setValidPassword] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);

  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [validConfirmPassword, setValidConfirmPassword] = React.useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] =
    React.useState(false);

  const [showPassword, toggleShowPassword] = useToggle();
  const [publicAccount, setPublicAccount] = React.useState(1)

  const { error, isError, isLoading, mutate, reset } = useMutation(
    BaseAPI.signup,
    {
      onSuccess: () => {
        setUsername("");
        setFirstName("");
        setLastName("");
        setAffiliation("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPublicAccount("");
        navigate("/signin");
      },
    }
  );

  const handleUsernameChange = (e) => {
    reset();
    setUsername(e.target.value);
    setValidUsername(USERNAME_REGEX.test(e.target.value));
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const handleAffiliationChange = (e) => {
    setAffiliation(e.target.value);
  };

  const handleEmailChange = (e) => {
    reset()
    setEmail(e.target.value);
    setValidEmail(EMAIL_REGEX.test(e.target.value))
  };

  const handlePasswordChange = (e) => {
    reset();
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    reset();
    setConfirmPassword(e.target.value);
  };

  const handlePublicAccountChange = (e) => {
    setPublicAccount(+(!Boolean(publicAccount)));
  }

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

  const handleEmailFocus = () => {
    setEmailFocused(true);
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
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
      mutate({ username, firstName, lastName, affiliation, publicAccount, password });
    }
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  return (
    <Root>
      <Fade in>
        <Box>
          <Card className={classes.card} variant="outlined">
            <CardContent className={classes.cardContent}>
              <Stack spacing={3}>
                <img
                  className={classes.logo}
                  src={WordmarkState()}
                  alt="ASReview LAB"
                />
                <Typography variant="h5">Create your profile</Typography>
                <Stack
                  spacing={3}
                  component="form"
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    id="username"
                    label="Username"
                    size="small"
                    fullWidth
                    autoFocus
                    error={
                      username !== "" && !validUsername && !usernameFocused
                    }
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
                        id="first_name"
                        label="First name"
                        size="small"
                        fullWidth
                        value={firstName}
                        onChange={handleFirstNameChange}
                      />
                      <TextField
                        id="last_name"
                        label="Last name"
                        size="small"
                        fullWidth
                        value={lastName}
                        onChange={handleLastNameChange}
                      />
                    </Stack>
                  </FormControl>
                  <TextField
                    id="affiliation"
                    label="Affiliation"
                    size="small"
                    fullWidth
                    value={affiliation}
                    onChange={handleAffiliationChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                  />
                <TextField
                    id="email"
                    label="Email"
                    size="small"
                    fullWidth
                    value={email}
                    error={
                      email !== "" && !validEmail && !emailFocused
                    }
                    helperText={
                      email && !validEmail && !emailFocused
                      ? "Sorry, the provided email address doesn't comply with our check."
                      : ""
                    }
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                    onChange={handleEmailChange}
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
                        <Checkbox
                          id="public"
                          color="primary"
                          onChange={toggleShowPassword}
                        />
                      }
                      label="Show password"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          defaultChecked={true}
                          value={publicAccount}
                          onChange={handlePublicAccountChange}
                        />
                      }
                      label="Make this account public"
                    />
                    <FormHelperText>
                      Making this account public allows you to collaborate.
                    </FormHelperText>
                  </FormControl>
                </Stack>
                {isError && <InlineErrorHandler message={error.message} />}
                <Stack className={classes.button} direction="row">
                  <Button onClick={handleSignIn} sx={{ textTransform: "none" }}>
                    Sign in instead
                  </Button>
                  <LoadingButton
                    loading={isLoading}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                  >
                    Create
                  </LoadingButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <HelpPrivacyTermsButton />
        </Box>
      </Fade>
    </Root>
  );
};

export default SignUpForm;

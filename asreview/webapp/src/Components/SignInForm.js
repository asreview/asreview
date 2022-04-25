import * as React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Fade,
  FormControl,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from ".";

import ProjectAPI from "../api/ProjectAPI";
import useAuth from "../hooks/useAuth";
import { useToggle } from "../hooks/useToggle";
import { WordmarkState } from "../globals";

const PREFIX = "SignInForm";

const classes = {
  button: `${PREFIX}-button`,
  card: `${PREFIX}-card`,
  cardContent: `${PREFIX}-card-content`,
  checkbox: `${PREFIX}-checkbox`,
  header: `${PREFIX}-header`,
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
    width: "450px",
  },

  [`& .${classes.cardContent}`]: {
    padding: "48px 40px",
  },

  [`& .${classes.header}`]: {
    alignItems: "center",
  },

  [`& .${classes.logo}`]: {
    width: "100%",
    maxWidth: "130px",
  },
}));

const SignInForm = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [showPassword, toggleShowPassword] = useToggle();

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateSignIn,
    {
      onSuccess: (data) => {
        const accessToken = data?.accessToken;
        setAuth({ username, password, accessToken });
        setUsername("");
        setPassword("");
        navigate(from, { replace: true });
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    reset();
    mutate({ username, password });
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <Root>
      <Fade in>
        <Card className={classes.card} variant="outlined">
          <CardContent className={classes.cardContent}>
            <Stack spacing={3}>
              <Stack className={classes.header} spacing={2}>
                <img
                  className={classes.logo}
                  src={WordmarkState()}
                  alt="ASReview LAB"
                />
                <Typography variant="h5">Sign in</Typography>
              </Stack>
              <Stack spacing={3}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  variant="outlined"
                  fullWidth
                  autoFocus
                />
                <FormControl>
                  <TextField
                    label="Password"
                    value={password}
                    onChange={handlePasswordChange}
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
                <Button onClick={handleSignUp}>Create profile</Button>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Sign in
                </LoadingButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Root>
  );
};

export default SignInForm;

import * as React from "react";
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from "react-query";
import {
  Box,
  Card,
  CardContent,
  Fade,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { styled } from "@mui/material/styles";

import { 
  SignInForm,
} from "../Components";

import { WordmarkState } from "../globals";
import { InlineErrorHandler } from ".";
import AuthAPI from "../api/AuthAPI";

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


const ForgotPassword = () => {
  const emailConfig = useSelector(state => state.email_config) || false;
  const [email, setEmail] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState(false);
  const queryClient = useQueryClient();

  const { error, isError, isLoading, mutate, reset } = useMutation(
    AuthAPI.forgotPassword,
    {
      onMutate: () => {
        // clear potential error
        queryClient.resetQueries("refresh");
      },
      onSuccess: (data) => {
          setEmail('');
          setSuccessMessage(data.message)
      },
      onError: (data) => {
        console.error('Forgot password error', data);
      }
    }
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    reset();
    mutate({ email });
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <Root>
      <Fade in>
        <Box>
          <Card className={classes.card} variant="outlined">
            <CardContent className={classes.cardContent}>
              <Stack spacing={3}>
                <Stack className={classes.header} spacing={2}>
                  <img
                    className={classes.logo}
                    src={WordmarkState()}
                    alt="ASReview LAB"
                  />
                  <Typography variant="h5">Forgot your password?</Typography>
                  { emailConfig && 
                    <p>
                        Enter your email address, click on the submit button and an email will be sent to you. 
                        Check your spam or bulk folder if you don't get an email.
                    </p>
                  }
                  { !emailConfig && <p>Contact your ASReview-app administrator</p>}
                </Stack>
                { emailConfig &&
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
                    </Stack>
                    {isError && <InlineErrorHandler message={error.message} />}
                    {successMessage && <p>{successMessage}</p>}

                    <Stack className={classes.button} direction="row">
                      <LoadingButton
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                      >
                        Submit
                      </LoadingButton>
                    </Stack>
                  </>
                }
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Root>
  );
};

export default ForgotPassword;
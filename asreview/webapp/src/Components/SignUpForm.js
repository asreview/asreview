import * as React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { HelpPrivacyTermsButton } from '../Components';

import { InlineErrorHandler } from '.';

import BaseAPI from '../api/AuthAPI';
import { useToggle } from '../hooks/useToggle';
import { WordmarkState } from '../globals';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PWD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const PREFIX = 'SignUpForm';

const classes = {
  button: `${PREFIX}-button`,
  card: `${PREFIX}-card`,
  cardContent: `${PREFIX}-card-content`,
  logo: `${PREFIX}-logo`,
};

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  [`& .${classes.button}`]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    justifyContent: 'space-between',
  },

  [`& .${classes.card}`]: {
    borderRadius: theme.spacing(2),
    width: '500px',
  },

  [`& .${classes.cardContent}`]: {
    padding: '48px 40px !important',
  },

  [`& .${classes.logo}`]: {
    width: '100%',
    maxWidth: '130px',
  },
}));

// helper functions for generating initial state object
const initState = (value='', validity=null, focus=null) => {
    return { value: value, isValid: validity, hasFocus: focus};
};

const initPasswordState = () => {
    return {
        password: '',
        confirmation: '',
        passwordValid: null,
        confirmationIsValid: null,
        passwordHasFocus: null,
        confirmationHasFocus: null
    };
}

// Reducer Functions
const usernameReducer = (state, action) => {
    const checkValidity = (input) => input === null ? true : USERNAME_REGEX.test(input);
    
    switch(action.type) {
        case 'INPUT':
            return { value: action.value, isValid: checkValidity(action.value), hasFocus: true };
        case 'FOCUS':
            return { ...state, isValid: checkValidity(state.value), hasFocus: true };
        case 'BLUR':
            return { ...state, isValid: checkValidity(state.value), hasFocus: false };
        case 'RESET':
            return initState();
        default:
            return state;
    }
};

const emailReducer = (state, action) => {
    const checkValidity = (input) => input === null ? true : EMAIL_REGEX.test(input);
    
    switch(action.type) {
        case 'INPUT':
            return { value: action.value, isValid: checkValidity(action.value), hasFocus: true };
        case 'FOCUS':
            return { value: state.value, isValid: checkValidity(state.value), hasFocus: true };
        case 'BLUR':
            return { value: state.value, isValid: checkValidity(state.value), hasFocus: false };
        case 'RESET':
            return initState();
        default:
            return state;
    }
};

const passwordReducer = (state, action) => {
    const checkValidity = (input) => input === null ? true : PWD_REGEX.test(input);
    const checkConfirmation = (password, confirmation) => password === confirmation;
    
    switch(action.type) {
        case 'INPUT_PASSWORD':
            return { ...state, password: action.value, passwordHasFocus: true };
        case 'INPUT_CONFIRMATION':
            return { ...state, confirmation: action.value, confirmPasswordHasFocus: true };
        case 'FOCUS_PASSWORD':
            return { ...state, passwordHasFocus: true };
        case 'FOCUS_CONFIRMATION':
            console.log(state.password, checkValidity(state.password));
            return { ...state, confirmationHasFocus: true, passwordValid: checkValidity(state.password) };
        case 'BLUR_PASSWORD':
            return { ...state, passwordHasFocus: false };
        case 'BLUR_CONFIRMATION':
            return { ...state, confirmationHasFocus: false };
        case 'RESET':
            return initPasswordState();
        default:
            return state;
    }
};


const SignUpForm = (props) => {
  const navigate = useNavigate();

  const [usernameState, dispatchUsername] = React.useReducer(usernameReducer, initState());
  const [emailState, dispatchEmail] = React.useReducer(emailReducer, initState());
  const [passwordState, dispatchPassword] = React.useReducer(passwordReducer, initPasswordState());

  const [showPassword, toggleShowPassword] = useToggle();

  const { error, isError, isLoading, mutate, reset } = useMutation(
    BaseAPI.signup,
    {
      onSuccess: () => {
        dispatchUsername({ type: 'RESET' });
        dispatchEmail({ type: 'RESET' });
        dispatchPassword({ type: 'RESET' });
        navigate('/signin');
      },
    }
  );


  // CHANGE HANDLERS
  const handleUsernameChange = (event) => {
    dispatchUsername({ type: 'INPUT', value: event.target.value });
  };

  const handleEmailChange = (event) => {
    dispatchEmail({ type: 'INPUT', value: event.target.value });
  };

  const handlePasswordChange = (event) => {
    dispatchPassword({ type: 'INPUT_PASSWORD', value: event.target.value });
  };

  const handleConfirmPasswordChange = (event) => {
    dispatchPassword({ type: 'INPUT_CONFIRMATION', value: event.target.value });
  };


  // FOCUS HANDLERS
  const handleUsernameFocus = () => {
    dispatchUsername({ type: 'FOCUS' });
  };

  const handleEmailFocus = () => {
    dispatchEmail({ type: 'FOCUS' });
  };

  const handlePasswordFocus = () => {
    dispatchPassword({ type: 'FOCUS_PASSWORD' });
  };

  const handleConfirmPasswordFocus = () => {
    dispatchPassword({ type: 'FOCUS_CONFIRMATION' })
  };


  // BLUR HANDLERS
  const handleUsernameBlur = () => {
    dispatchUsername({ type: 'BLUR' });
  };

  const handleEmailBlur = () => {
    dispatchUsername({ type: 'BLUR' });
  };

  const handlePasswordBlur = () => {
    dispatchPassword({ type: 'BLUR_PASSWORD'})
  };

  const handleConfirmPasswordBlur = () => {
    dispatchPassword({ type: 'BLUR_CONFIRMATION'})
  };


  React.useEffect(() => {
    // setValidPassword(PWD_REGEX.test(password));
    // setValidConfirmPassword(confirmPassword === password);
  }, [passwordState]);





  const passwordInputType = () => {
    return !showPassword ? 'password' : 'text';
  };

  const returnHelperText = () => {
    // if (password && !passwordFocused && !validPassword) {
    //   return 'Sorry, your password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.';
    // } else if (
    //   confirmPassword &&
    //   !confirmPasswordFocused &&
    //   !validConfirmPassword
    // ) {
    //   return 'Passwords do not match. Try again.';
    // } else {
    //   return null;
    // }
    return null;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (true) {
      //mutate({ username, firstName, lastName, affiliation, publicAccount, password });
    } else {

    }
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <Root>
      <Fade in>
        <Box>
          <Card className={classes.card} variant='outlined'>
            <CardContent className={classes.cardContent}>
              <Stack spacing={3}>
                <img
                  className={classes.logo}
                  src={WordmarkState()}
                  alt='ASReview LAB'
                />
                <Typography variant='h5'>Create your profile</Typography>
                <Stack
                  spacing={3}
                  component='form'
                  noValidate
                  autoComplete='off'
                >
                  <TextField
                    id='username'
                    label='Username'
                    size='small'
                    fullWidth
                    autoFocus
                    error={usernameState.isValid === false}
                    helperText={
                      (usernameState.isValid === false)
                        ? 'Sorry, your username must be between 3 and 20 characters long and only contain letters (a-z), numbers (0-9), and underscores (_).'
                        : 'You can use letters, numbers & underscores'
                    }
                    value={usernameState.value}
                    onChange={handleUsernameChange}
                    onFocus={handleUsernameFocus}
                    onBlur={handleUsernameBlur}
                  />
                  <FormControl>
                    <Stack direction='row' spacing={2}>
                      <TextField
                        id='first_name'
                        label='First name'
                        size='small'
                        fullWidth
                      />
                      <TextField
                        id='last_name'
                        label='Last name'
                        size='small'
                        fullWidth
                      />
                    </Stack>
                  </FormControl>
                  <TextField
                    id='affiliation'
                    label='Affiliation'
                    size='small'
                    fullWidth
                  />
                <TextField
                    id='email'
                    label='Email'
                    size='small'
                    fullWidth
                    value={emailState.value}
                    error={emailState.isValid === false}
                    helperText={
                      (emailState.isValid === false)
                      ? "Sorry, the provided email address doesn't comply with our format checks."
                      : null
                    }
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                    onChange={handleEmailChange}
                  />
                  <FormControl>
                    <Stack direction='row' spacing={2}>
                      <TextField
                        id='password'
                        label='Password'
                        size='small'
                        fullWidth
                        error={passwordState.passwordValid===false}
                        type={passwordInputType()}
                        value={passwordState.password}
                        onChange={handlePasswordChange}
                        onFocus={handlePasswordFocus}
                        onBlur={handlePasswordBlur}
                      />
                      <TextField
                        id='confirm'
                        label='Confirm Password'
                        size='small'
                        fullWidth
                        error={
                        //   confirmPassword !== '' &&
                        //   !confirmPasswordFocused &&
                        //   !validConfirmPassword
                            false
                        }
                        type={passwordInputType()}
                        value={passwordState.confirmation}
                        onChange={handleConfirmPasswordChange}
                        onFocus={handleConfirmPasswordFocus}
                        onBlur={handleConfirmPasswordBlur}
                      />
                    </Stack>
                    <FormHelperText error={returnHelperText() !== null}>
                      {!returnHelperText()
                        ? 'Use 8 or more characters with a mix of letters, numbers & symbols'
                        : returnHelperText()}
                    </FormHelperText>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id='public'
                          color='primary'
                          onChange={toggleShowPassword}
                        />
                      }
                      label='Show password'
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          color='primary'
                          defaultChecked={true}
                        />
                      }
                      label='Make this account public'
                    />
                    <FormHelperText>
                      Making this account public allows you to collaborate.
                    </FormHelperText>
                  </FormControl>
                </Stack>
                {isError && <InlineErrorHandler message={error.message} />}
                <Stack className={classes.button} direction='row'>
                  <Button onClick={handleSignIn} sx={{ textTransform: 'none' }}>
                    Sign in instead
                  </Button>
                  <LoadingButton
                    loading={isLoading}
                    variant='contained'
                    color='primary'
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

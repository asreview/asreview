
import * as React from "react";
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from "react-query";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Fade,
  FormControl,
  FormControlLabel,
  FormHelperText as FHT,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { styled } from "@mui/material/styles";
import AuthAPI from "../api/AuthAPI";
import { WordmarkState } from "../globals";
import { useToggle } from "../hooks/useToggle";
import { useFormik } from 'formik';
import * as Yup from 'yup';

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

// VALIDATION SCHEMA
const SignupSchema = Yup.object().shape({
  password: Yup.string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Use 8 or more characters with a mix of letters, numbers & symbols'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

const ResetPassword = (props) => {
  const queryClient = useQueryClient();
  const [showPassword, toggleShowPassword] = useToggle();

  const initialValues = {
    password: '',
    confirmPassword: ''
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignupSchema,
  });

  const returnType = () => {
    return !showPassword ? "password" : "text";
  };

  const { error, isError, isLoading, mutate, reset } = useMutation(
    AuthAPI.forgotPassword,
    {
      onMutate: () => {
        // clear potential error
        queryClient.resetQueries("refresh");
      },
      onSuccess: (data) => {
          //setEmail('');
          //setSuccessMessage(data.message)
          let a = 1;
      },
      onError: (data) => {
        console.error('Forgot password error', data);
      }
    }
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    reset();
    //mutate({ password });
  }

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
                  <Typography variant="h5">Reset your password</Typography>
                </Stack>

                <FormControl>
                  <Stack spacing={3}>
                    <TextField
                      id="password"
                      label="Password"
                      size="small"
                      fullWidth
                      autoFocus
                      variant="outlined"
                      type={returnType()}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <TextField
                      id="confirmPassword"
                      label="Confirm Password"
                      size="small"
                      fullWidth
                      variant="outlined"
                      type={returnType()}
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Stack>
                </FormControl>
                {formik.touched.password && formik.errors.password ? <FHT error={true}>{formik.errors.password}</FHT> : null}
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? <FHT error={true}>{formik.errors.confirmPassword}</FHT> : null}
                <FormControl>
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
                </FormControl>
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

              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Root>
  )

}

export default ResetPassword;
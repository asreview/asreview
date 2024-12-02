import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Fade,
  Stack,
} from "@mui/material";

import {
  ForgotPassword,
  ConfirmAccount,
  HelpPrivacyTermsButton,
  SignInForm,
  SignUpForm,
  ResetPassword,
} from "Components";

import { WordMark } from "icons/WordMark";

const AuthPage = ({
  signIn = false,
  signUp = false,
  forgotPassword = false,
  resetPassword = false,
  confirmAccount = false,
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Fade in>
        <Stack
          sx={(theme) => ({
            width: "100%",
            maxWidth: 500,
          })}
          spacing={3}
        >
          <Card
            sx={(theme) => ({
              [theme.breakpoints.down(500)]: {
                boxShadow: 0,
              },
            })}
          >
            <CardContent>
              <Stack spacing={3}>
                <Box display="flex" justifyContent="center">
                  <WordMark style={{ maxWidth: "130px", paddingTop: 10 }} />
                </Box>
                {typeof window.loginInfo === "string" &&
                  window.loginInfo.length > 0 && (
                    <Alert severity="info">{window.loginInfo}</Alert>
                  )}
                <Divider />
              </Stack>
            </CardContent>

            {signUp && <SignUpForm />}

            {signIn && (
              <SignInForm
                allowAccountCreation={window.allowAccountCreation}
                emailVerification={window.emailVerification}
              />
            )}

            {confirmAccount && <ConfirmAccount />}

            {forgotPassword && <ForgotPassword />}

            {resetPassword && <ResetPassword />}
          </Card>
          <HelpPrivacyTermsButton />
        </Stack>
      </Fade>
    </Box>
  );
};

export default AuthPage;

import { Alert, Box, Card, CardContent, Fade, Stack } from "@mui/material";

import {
  ConfirmAccount,
  ForgotPassword,
  HelpPrivacyTermsButton,
  ResetPassword,
  SignInForm,
  SignUpForm,
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
      sx={(theme) => ({
        [theme.breakpoints.down(500)]: {
          p: 2,
        },
      })}
    >
      <Fade in timeout={1000}>
        <Stack
          sx={{
            width: "100%",
            maxWidth: 500,
          }}
          spacing={3}
        >
          <Box display="flex" justifyContent="center">
            <WordMark style={{ maxWidth: "130px", paddingTop: 10 }} />
          </Box>
          <Card>
            {typeof window.loginInfo === "string" &&
              window.loginInfo.length > 0 && (
                <CardContent>
                  <Alert severity="info">{window.loginInfo}</Alert>
                </CardContent>
              )}

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

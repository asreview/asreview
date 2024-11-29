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
  HelpPrivacyTermsButton,
  SignInForm,
  SignUpForm,
  ResetPassword,
  OTPForm,
} from "Components";
import { useToggle } from "hooks/useToggle";

import { WordMark } from "icons/WordMark";

const AuthPage = ({ reset_password = false, enter_otp = false }) => {
  const [signUp, toggleSignUp] = useToggle(false);

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

            {!enter_otp && !reset_password && signUp && (
              <SignUpForm
                // showNotification={window.emailVerification && showNotification}
                toggleSignUp={toggleSignUp}
              />
            )}

            {!enter_otp && !reset_password && !signUp && (
              <SignInForm
                allowAccountCreation={window.allowAccountCreation}
                emailVerification={window.emailVerification}
                toggleSignUp={toggleSignUp}
              />
            )}

            {reset_password && <ResetPassword />}

            {enter_otp && <OTPForm />}
          </Card>
          <HelpPrivacyTermsButton />
        </Stack>
      </Fade>
    </Box>
  );
};

export default AuthPage;

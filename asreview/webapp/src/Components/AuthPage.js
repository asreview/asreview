import {
  Box,
  Card,
  Fade,
  Grid2 as Grid,
  CardContent,
  Alert,
  Typography,
} from "@mui/material";

import {
  ConfirmAccount,
  ForgotPassword,
  HelpPrivacyTermsButton,
  ResetPassword,
  SignInForm,
  SignUpForm,
} from "Components";

const AuthPage = ({
  signIn = false,
  signUp = false,
  forgotPassword = false,
  resetPassword = false,
  confirmAccount = false,
}) => {
  return (
    <Grid
      container
      maxWidth="lg"
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        margin: "0 auto", // Center horizontally
        alignItems: "center", // Center vertically
        padding: 2,
      }}
    >
      <Grid
        justifyContent={"center"}
        justifyItems={"center"}
        size={{
          xs: 12,
          md: "auto",
        }}
      >
        <Fade in timeout={300}>
          <Box sx={{ width: { xs: "100%", sm: "400px" } }}>
            <Card>
              {typeof window.loginInfo === "string" &&
                window.loginInfo.length > 0 && (
                  <CardContent>
                    <Alert severity="info" color="secondary">
                      {window.loginInfo}
                    </Alert>
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
          </Box>
        </Fade>
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: "grow",
        }}
        display={{ xs: "none", md: "flex" }}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <Fade in timeout={1000}>
          <Box>
            <Typography variant="h4" align="center" fontFamily={"Roboto Serif"}>
              Welcome to{" "}
              <Typography
                component="span"
                sx={{ fontFamily: "kanit", fontSize: "130%", mr: 0.5 }}
              >
                ASReview
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontFamily: "kanit",
                  fontSize: "130%",
                  fontWeight: "bold",
                }}
                color="#FFCC00"
              >
                LAB
              </Typography>
            </Typography>

            <Typography
              variant="h6"
              align="center"
              marginTop={2}
              fontFamily={"Roboto Serif"}
            >
              Transparent systematic reviews with AI
            </Typography>
          </Box>
        </Fade>
      </Grid>
    </Grid>
  );
};

export default AuthPage;

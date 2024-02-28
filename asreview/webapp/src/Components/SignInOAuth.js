// The business logic of this component comes from the
// following URL: https://tasoskakour.com/blog/react-use-oauth2

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Stack, Typography } from "@mui/material";
import { GitHub, Google } from "@mui/icons-material";
import { Orcid } from "icons";
import AuthAPI from "api/AuthAPI";
import useAuth from "hooks/useAuth";
import { InlineErrorHandler } from ".";
import OauthPopup from "react-oauth-popup";

const POPUP_HEIGHT = 700;
const POPUP_WIDTH = 600;

const redirect_uri = `${window.location.origin}/oauth_callback`;

const generateOAuthUrl = (config) => {
  return (
    `${config.authorization_url}?response_type=code&client_id=${config.client_id}` +
    `&redirect_uri=${redirect_uri}&scope=${config.scope}&state=${config.state}`
  );
};

const SignInOauth = (props) => {
  const classes = props.classes;
  const oAuthData = props.oAuthData;
  const oAuthServices = oAuthData.services;
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSignin = (code, provider) => {
    let message = "";

    const payload = {
      provider: provider,
      code: code,
      redirect_uri: redirect_uri,
    };

    AuthAPI.oAuthCallback(payload)
      .then((data) => {
        if (data.logged_in) {
          setAuth({
            logged_in: data.logged_in,
            name: data.name,
            id: data.id,
          });
          // Authentication was successful, do we have
          // to go to the profile page (if this is the first
          // time), or do we go to projects
          if (Boolean(data?.account_created)) {
            navigate("/profile?first_time=true");
          } else {
            navigate("/projects");
          }
        } else {
          message = "Backend could not log you in.";
          console.error(message);
          setErrorMessage(message);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  const getIcon = (service) => {
    switch (service) {
      case "google":
        return <Google />;
      case "github":
        return <GitHub />;
      case "orcid":
        return <Orcid />;
      default:
        return service;
    }
  };

  return (
    <>
      <Stack className={classes.button} direction="row">
        <Typography variant="body1">Or sign in with:</Typography>
        {Object.keys(oAuthServices).map((provider) => {
          let config = oAuthServices[provider];
          return (
            <OauthPopup
              url={generateOAuthUrl(config)}
              onCode={(code) => handleSignin(code, provider)}
              onClose={(data) => true}
              key={provider}
              width={POPUP_WIDTH}
              height={POPUP_HEIGHT}
            >
              <IconButton
                onClick={() => "true"} //handleOauthSignIn(provider)}
                key={provider}
              >
                {getIcon(provider)}
              </IconButton>
            </OauthPopup>
          );
        })}
      </Stack>
      {Boolean(errorMessage) && <InlineErrorHandler message={errorMessage} />}
    </>
  );
};

export default SignInOauth;

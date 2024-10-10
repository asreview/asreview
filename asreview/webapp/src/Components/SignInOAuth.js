// The business logic of this component comes from the
// following URL: https://tasoskakour.com/blog/react-use-oauth2

import { GitHub, Google } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import AuthAPI from "api/AuthAPI";
import { Orcid } from "icons";
import * as React from "react";
import OauthPopup from "react-oauth-popup";
import { useNavigate } from "react-router-dom";
import { InlineErrorHandler } from ".";

const POPUP_HEIGHT = 700;
const POPUP_WIDTH = 600;

const redirect_uri = `${window.location.origin}/oauth_callback`;

const generateOAuthUrl = (config) => {
  return (
    `${config.authorization_url}?response_type=code&client_id=${config.client_id}` +
    `&redirect_uri=${redirect_uri}&scope=${config.scope}&state=${config.state}`
  );
};

const SignInOauth = ({ oAuthConfig }) => {
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
          if (Boolean(data?.account_created)) {
            navigate("/profile?first_time=true");
          } else {
            navigate("/reviews");
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
      <Stack direction="row">
        <Typography variant="body1">Or sign in with:</Typography>
        {Object.keys(oAuthConfig.services).map((provider) => {
          let config = oAuthConfig.services[provider];
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

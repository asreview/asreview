// The business logic of this component comes from the
// following URL: https://tasoskakour.com/blog/react-use-oauth2

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  GitHub,
  Google
} from "@mui/icons-material";
import { Orcid } from "../icons";
import AuthAPI from "../api/AuthAPI";
import useAuth from "../hooks/useAuth";
import { InlineErrorHandler } from ".";

const POPUP_HEIGHT = 700;
const POPUP_WIDTH = 600;

const generateState = () => {
	const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let array = new Uint8Array(40);
	window.crypto.getRandomValues(array);
	array = array.map((x) => validChars.codePointAt(x % validChars.length));
	const randomState = String.fromCharCode.apply(null, array);
	return randomState;
};

const openPopup = (url) => {
	// To fix issues with window.screen in multi-monitor setups, the easier option is to
	// center the pop-up over the parent window.
	const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
	const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
	return window.open(
		url,
		'OAuth2 Popup',
		`height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`
	);
};

const closePopup = (popupRef) => {
	popupRef.current?.close();
};

const enhanceAuthorizeUrl = (
	authorizeUrl,
	clientId,
	redirectUri,
	scope,
	state
) => {
	return `${authorizeUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
};

const saveState = (key, value) => {
	sessionStorage.setItem(key, value);
};

const removeState = (key) => {
	sessionStorage.removeItem(key);
};

const SignInOauth = (props) => {
  const classes = props.classes;
  const oAuthData = props.oAuthData;
  const oAuthServices = oAuthData.services;
  const messageType = oAuthData.messageType;
  const compareKey = oAuthData.compareKey;

  const popupRef = React.useRef();
  const intervalRef = React.useRef();
  const [{ loading, error }, setUI] = React.useState({ loading: false, error: null });
  const [errorMessage, setErrorMessage] = React.useState('')
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  let message = '';

  const handleOauthSignIn = React.useCallback((provider) => {
    let service = oAuthServices[provider]
    let redirect_uri = `${window.location.origin}/oauth_callback`;

    // 1. Init
    setUI({
      loading: true,
      error: null,
    });

    // 2. Generate and save state
    const state = generateState();
    saveState(compareKey, state);

    // 3. Open popup
    popupRef.current = openPopup(
      enhanceAuthorizeUrl(
        service.authorization_url,
        service.client_id,
        redirect_uri,
        service.scope,
        state
      )
    );

    // 4. Register message listener that listens to popup window
    async function handleMessageListener(message) {
      try {
        const type = message && message.data && message.data.type;
        if (type === messageType) {

          const errorMaybe = message && message.data && message.data.error;
          if (errorMaybe) {
            message = 'Unknown Error';
            setUI({
              loading: false,
              error: errorMaybe || message,
            });
            setErrorMessage(message);
          } else {
            const code = message && message.data && message.data.payload && message.data.payload.code;
            const payload = {
              provider: provider,
              code: code,
              redirect_uri: redirect_uri,
            }
            AuthAPI.oAuthCallback(payload)
              .then(data => {
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
                  message = 'Backend could not log you in.'
                  console.error(message);
                  setErrorMessage(message);
                }
              })
              .catch(err => {
                message = 'Did not receive OAuth data from backend';
                console.error(message, err)
                setErrorMessage(message);
              });
          }
        }
      } catch (genericError) {
        console.error(genericError);
        setUI({
          loading: false,
          error: genericError.toString(),
        });
        setErrorMessage(genericError.toString());
      } finally {
        // Clear stuff ...
        clearInterval(intervalRef.current);
        closePopup(popupRef);
        removeState(compareKey);
        window.removeEventListener('message', handleMessageListener);
      }
    }
    window.addEventListener('message', handleMessageListener);

    // 5. Begin interval to check if popup was closed forcefully by the user
    intervalRef.current = setInterval(() => {
      const popupClosed = !popupRef.current || !popupRef.current.window || popupRef.current.window.closed;
      if (popupClosed) {
        // Popup was closed before completing auth...
        setUI((ui) => ({
          ...ui,
          loading: false,
        }));
        message = 'Warning: Popup was closed before completing authentication.'
        console.warn(message);
        setErrorMessage(message);
        clearInterval(intervalRef.current);
        // cleanup compareKey
        removeState(compareKey);
        window.removeEventListener('message', handleMessageListener);
      }
    }, 250);

    // Remove listener(s) on unmount
    return () => {
      window.removeEventListener('message', handleMessageListener);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  });

  const getIcon = (service) => {
    switch(service) {
      case 'google':
        return <Google/>
      case 'github':
        return <GitHub/>
      case 'orcid':
        return <Orcid/>
      default:
        return service
    }
  }

  return (
    <>
      <Stack className={classes.button} direction="row">
      <Typography variant="body1">Or sign in with:</Typography>
      { Object.keys(oAuthServices).map((provider) => {
        return (
          <IconButton
            onClick={() => handleOauthSignIn(provider)}
            key={provider}
          >
            {getIcon(provider)}
          </IconButton>
        )
      })}
      </Stack>
      {Boolean(errorMessage) && <InlineErrorHandler message={errorMessage} />}
    </>
  )
};

export default SignInOauth;
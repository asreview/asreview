// The business logic of this component comes from the
// following URL: https://tasoskakour.com/blog/react-use-oauth2

import * as React from "react";
import { useSelector } from 'react-redux';
import {
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Apple, 
  Google, 
  LinkedIn
} from "@mui/icons-material";
import AuthAPI from "../api/AuthAPI";

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

const objectToQuery = (object) => {
  return new URLSearchParams(object).toString();
};

const formatExchangeCodeForTokenServerURL = (
  serverUrl,
  clientId,
  code,
  redirectUri
) => {
  return `${serverUrl}?${objectToQuery({
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
	})}`;
};

const saveState = (key, value) => {
	sessionStorage.setItem(key, value);
};

const removeState = (key) => {
	sessionStorage.removeItem(key);
};

const SignInOauth = (props) => {
  const classes = props.classes;

  const oAuthData = useSelector(state => state.oAuthData);
  const oAuthServices = oAuthData.services || [];
  const messageType = oAuthData.messageType;
  const compareKey = oAuthData.compareKey;

  const popupRef = React.useRef();
  const intervalRef = React.useRef();
  const [{ loading, error }, setUI] = React.useState({ loading: false, error: null });

  const handleOauthSignIn = React.useCallback((service) => {
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
        service.authentication_url,
        service.client_id,
        service.redirect_uri,
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
            setUI({
              loading: false,
              error: errorMaybe || 'Unknown Error',
            });

          } else {

            const code = message && message.data && message.data.payload && message.data.payload.code;
            const payload = {
              provider: service.provider,
              clientId: service.client_id,
              code: code,
              redirectURI: service.redirect_uri,
            }
            AuthAPI.oAuthCallback(payload)
              .then(data => {
                console.log(data)
              })
              .catch(err => console.log('Could not pull all projects', err));
            

            // const response = await fetch(
            //   formatExchangeCodeForTokenServerURL(
            //     'https://your-server.com/token',
            //     service.client_id,
            //     code,
            //     service.redirect_uri
            //   )
            // );

            // if (!response.ok) {
            //   setUI({
            //     loading: false,
            //     error: "Failed to exchange code for token",
            //   });
            // } else {
            //   const payload = await response.json();
            //   setUI({
            //     loading: false,
            //     error: null,
            //   });
            //   //setData(payload);
            //   // Lines above will cause 2 rerenders but it's fine for this tutorial :-)
            // }

          }
        }
      } catch (genericError) {
        console.error(genericError);
        setUI({
          loading: false,
          error: genericError.toString(),
        });
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
        console.warn('Warning: Popup was closed before completing authentication.');
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

  return (
    <Stack className={classes.button} direction="row">
    <Typography variant="body1">Or sign in with:</Typography>
    { oAuthServices.map((service) => {
      return (
        <IconButton
          onClick={() => handleOauthSignIn(service)}
          key={service.provider}
        >
          < Google />
        </IconButton>
      )
    })}
    </Stack>
  )
};

export default SignInOauth;
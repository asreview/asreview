import * as React from "react";
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

// https://tasoskakour.com/blog/react-use-oauth2
const OAUTH_STATE_KEY = 'react-use-oauth2-state-key';
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

const saveState = (state) => {
	sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

const removeState = () => {
	sessionStorage.removeItem(OAUTH_STATE_KEY);
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

const SignInOauth = (props) => {
  const classes = props.classes;
  const oauthServices = props.oauthServices || [];

  const popupRef = React.useRef();
  const [{ loading, error }, setUI] = React.useState({ loading: false, error: null });

  const handleOauthSignIn = React.useCallback((service) => {
    // 1. Init
    setUI({
      loading: true,
      error: null,
    });

    // 2. Generate and save state
    const state = generateState();
    saveState(state);

    // 3. Open popup
    popupRef.current = openPopup(
      enhanceAuthorizeUrl(
        service.url,
        service.client_id,
        service.redirect_uri,
        service.scope,
        'somestate'
      )
    );
  });

  return (
    <Stack className={classes.button} direction="row">
    <Typography variant="body1">Or sign in with:</Typography>
    { oauthServices.map((service) => {
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

}

export default SignInOauth;
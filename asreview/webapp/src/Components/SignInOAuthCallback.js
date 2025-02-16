import { useEffect } from "react";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

const queryToObject = (query) => {
  const parameters = new URLSearchParams(query);
  return Object.fromEntries(parameters.entries());
};

const checkState = (key, receivedState) => {
  const state = sessionStorage.getItem(key);
  return state === receivedState;
};

const SignInOAuthCallback = () => {
  // get window.oAuthData (for state comparison to avoid CSRF)
  const compareKey = window.oAuthData.compareKey;
  const messageType = window.oAuthData.messageType;

  // On mount
  useEffect(() => {
    const payload = queryToObject(window.location.search.split("?")[1]);
    const state = payload && payload.state;
    const error = payload && payload.error;

    if (!window.opener) {
      throw new Error("No window opener");
    }

    if (error) {
      window.opener.postMessage({
        type: messageType,
        error: decodeURI(error) || "OAuth error: An error has occured.",
      });
    } else if (state && checkState(compareKey, state)) {
      window.opener.postMessage({
        type: messageType,
        payload,
      });
    } else {
      window.opener.postMessage({
        type: messageType,
        error: "OAuth error: State mismatch.",
      });
    }
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
};

export default SignInOAuthCallback;

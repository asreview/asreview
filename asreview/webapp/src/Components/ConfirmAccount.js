import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { InlineErrorHandler } from ".";
import { AuthAPI } from "../api";

let requestedAPI = false;

const ConfirmAccount = ({ showNotification }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage] = React.useState(false);

  // This effect does a boot request to gather information
  // from the backend
  React.useEffect(() => {
    if (!requestedAPI) {
      let userId = searchParams.get("user_id");
      let token = searchParams.get("token");

      AuthAPI.confirmAccount({
        userId: userId,
        token: token,
      })
        .then((response) => {
          requestedAPI = true;
          showNotification("Your account has been confirmed. Please sign in.");
          navigate("/signin");
        })
        .catch((err) => {
          showNotification("Your account could not be confirmed!", "error");
          console.log(err);
        });
    }
  }, [navigate, searchParams, showNotification]);

  return (
    <div>
      {Boolean(errorMessage) && <InlineErrorHandler message={errorMessage} />}
    </div>
  );
};

export default ConfirmAccount;

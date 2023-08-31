import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { InlineErrorHandler } from ".";
import { AuthAPI } from "../api/index.js";

const ConfirmAccount = (props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = React.useState(false);

  // This effect does a boot request to gather information
  // from the backend
  React.useEffect(() => {
    let userId = searchParams.get("user_id");
    let token = searchParams.get("token");

    AuthAPI.confirmAccount({
      userId: userId,
      token: token,
    })
      .then((response) => {
        props.showNotification("Your account has been confirmed. Please sign in.");
        navigate("/signin");
      })
      .catch((err) => {
        props.showNotification("Your account could not be confirmed!", "error");
        console.log(err);
      });
  }, [navigate, searchParams]);

  return (
    <div>
      {Boolean(errorMessage) && <InlineErrorHandler message={errorMessage} />}
    </div>
  );
};

export default ConfirmAccount;

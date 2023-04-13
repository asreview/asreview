import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { InlineErrorHandler } from ".";
import { AuthAPI } from "../api/index.js";

const ConfirmAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = React.useState(false);

  // This effect does a boot request to gather information 
  // from the backend
  React.useEffect(() => {
    let userId = searchParams.get('user_id')
    let token = searchParams.get('token');
    console.log(userId, token);

    AuthAPI.confirmAccount({
      userId: userId,
      token: token
    })
    .then(response => {
      navigate('/signin')
    })
    .catch(err => {
      // I'd like to have a flash!
      console.log(err);
      setErrorMessage('Could not confirm account: ' + err.message);
    });
  }, [navigate, searchParams])

  return (
    <div>
      {Boolean(errorMessage) && <InlineErrorHandler message={errorMessage} />}
    </div>
  )

};

export default ConfirmAccount;
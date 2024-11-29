import {
  Box,
  Button,
  CardActions,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { InlineErrorHandler } from ".";

import AuthAPI from "api/AuthAPI";
import { useToggle } from "hooks/useToggle";

const OTPForm = ({ allowAccountCreation, emailVerification, toggleSignUp }) => {
  const [otp, setOtp] = React.useState(new Array(6).fill(""));

  const navigate = useNavigate();

  const { error, isError, isLoading, mutate, reset } = useMutation(
    AuthAPI.signin,
    {
      onSuccess: (data) => {
        // if (data.logged_in) {
        //   setEmail("");
        //   setPassword("");
        //   if (from === "/") {
        //     navigate("/reviews");
        //   } else {
        //     navigate(from, { replace: true });
        //   }
        // } else {
        //   console.error("Backend could not log you in.");
        // }
      },
      onError: (data) => {
        console.error("Signin error", data);
      },
    },
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    reset();
    mutate({ otp: otp.join("") });
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to the next input field automatically
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      document.getElementById("otp-5").focus(); // Move focus to the last field
    }
  };

  return (
    <>
      <CardContent>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5">Enter OTP</Typography>
          <Box width="85%" margin="auto">
            <Stack direction="row" spacing={1} onPaste={handlePaste}>
              {otp.map((value, index) => (
                <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  variant="outlined"
                  slotProps={{
                    htmlInput: {
                      maxLength: 1,
                      style: {
                        textAlign: "center",
                        fontSize: "1.5rem",
                        width: "3rem",
                        height: "3rem",
                      },
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
      <CardActions
        sx={{
          p: 2,
          justifyContent: "center",
          alignItem: "center",
        }}
      >
        <Button
          id="submit"
          disabled={isLoading}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>

        <Button
          id="sign_in"
          onClick={toggleSignUp}
          sx={{ textTransform: "none" }}
        >
          Sign in
        </Button>
      </CardActions>
    </>
  );
};

export default OTPForm;

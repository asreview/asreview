import { Box, Stack, TextField } from "@mui/material";
import * as React from "react";

const OTPFormField = ({ otp, onOtpChange, setFieldValue, setFieldTouched }) => {
  const handleOtpChange = (index, value) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    onOtpChange(updatedOtp);
    setFieldValue("otp", updatedOtp.join("")); // Join to make it a string

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleBlur = () => {
    setFieldTouched("otp", true); // Mark 'otp' field as touched when it loses focus
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
      onOtpChange(newOtp); // Notify parent with OTP
      setFieldValue("otp", newOtp.join("")); // Update Formik's OTP field
      document.getElementById("otp-5").focus(); // Move focus to the last field
    }
  };

  return (
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
            onBlur={handleBlur}
            variant="outlined"
            slotProps={{
              htmlInput: {
                maxLength: 1,
                style: {
                  textAlign: "center",
                  fontSize: "2rem",
                  width: "3rem",
                  height: "3rem",
                },
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default OTPFormField;

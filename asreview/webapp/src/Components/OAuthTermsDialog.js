import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const OAuthTermsDialog = ({ open, onAccept, onCancel }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleAccept = () => {
    if (!termsAccepted) {
      setShowError(true);
      return;
    }
    onAccept();
  };

  const handleCheckboxChange = (event) => {
    setTermsAccepted(event.target.checked);
    if (event.target.checked) {
      setShowError(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Terms of Agreement</DialogTitle>
      <DialogContent>
        <FormControl error={showError} fullWidth>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label={
              <Box>
                <ReactMarkdown>{window.termsText}</ReactMarkdown>
              </Box>
            }
          />
          {showError && (
            <FormHelperText error>
              You must accept the terms of agreement to continue
            </FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          color="primary"
          disabled={!termsAccepted}
        >
          Accept and Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OAuthTermsDialog;

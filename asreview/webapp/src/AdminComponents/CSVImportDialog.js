import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";
import { Upload, CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import * as Yup from "yup";
import { passwordValidation, passwordRequirements } from "globals.js";

// Yup schema for CSV row validation
const userSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: passwordValidation(Yup.string()).required("Password is required"),
  affiliation: Yup.string(),
  role: Yup.string().oneOf(
    ["admin", "member"],
    "Role must be 'admin' or 'member'",
  ),
});

const CSVImportDialog = ({ open, onClose, onImport, isImporting }) => {
  const [file, setFile] = React.useState(null);
  const [parsedData, setParsedData] = React.useState(null);
  const [errors, setErrors] = React.useState([]);
  const [importResults, setImportResults] = React.useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      return;
    }

    // Check if file is CSV
    if (
      !selectedFile.name.endsWith(".csv") &&
      selectedFile.type !== "text/csv"
    ) {
      setErrors(["Please select a valid CSV file"]);
      setFile(null);
      setParsedData(null);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setParsedData(null);
    setImportResults(null);

    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCSV(text);
        setParsedData(parsed);
      } catch (error) {
        setErrors([error.message]);
        setParsedData(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain a header row and at least one data row",
      );
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Check required headers
    if (
      !headers.includes("name") ||
      !headers.includes("email") ||
      !headers.includes("password")
    ) {
      throw new Error(
        "CSV must contain 'name', 'email', and 'password' columns",
      );
    }

    // Parse data rows
    const users = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length !== headers.length) {
        parseErrors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const user = {};
      headers.forEach((header, index) => {
        user[header] = values[index];
      });

      // Validate user data with Yup
      try {
        userSchema.validateSync(user, { abortEarly: false });
        users.push(user);
      } catch (validationError) {
        if (validationError.inner && validationError.inner.length > 0) {
          validationError.inner.forEach((err) => {
            parseErrors.push(`Row ${i + 1}: ${err.message}`);
          });
        } else {
          parseErrors.push(`Row ${i + 1}: ${validationError.message}`);
        }
      }
    }

    if (parseErrors.length > 0) {
      throw new Error(`CSV validation errors:\n${parseErrors.join("\n")}`);
    }

    if (users.length === 0) {
      throw new Error("No valid users found in CSV file");
    }

    return users;
  };

  const handleImport = async () => {
    if (!parsedData) return;

    // Clear any previous errors
    setErrors([]);

    try {
      const results = await onImport(parsedData);
      setImportResults(results);
    } catch (error) {
      // Extract error message from various possible locations
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to import users";
      setErrors([errorMessage]);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setErrors([]);
    setImportResults(null);
    onClose();
  };

  const successCount = importResults?.success?.length || 0;
  const failureCount = importResults?.failed?.length || 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Users from CSV</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Instructions */}
          <Alert severity="info">
            <Typography variant="body2">
              Upload a CSV file with the following columns:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Required:</strong> name, email, password
            </Typography>
            <Typography variant="body2">
              <strong>Optional:</strong> affiliation, role (admin/member)
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: "0.8rem" }}>
              {passwordRequirements}
            </Typography>
          </Alert>

          {/* File Upload */}
          <Box>
            <input
              accept=".csv,text/csv"
              style={{ display: "none" }}
              id="csv-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                fullWidth
              >
                Select CSV File
              </Button>
            </label>
            {file && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {file.name}
              </Typography>
            )}
          </Box>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert severity="error">
              {errors.map((error, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {error}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Preview */}
          {parsedData && !importResults && (
            <Alert severity="success">
              <Typography variant="body2">
                Successfully parsed {parsedData.length} user
                {parsedData.length > 1 ? "s" : ""} from CSV
              </Typography>
            </Alert>
          )}

          {/* Import Results */}
          {importResults && (
            <Box>
              <Alert
                severity={failureCount > 0 ? "warning" : "success"}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Import Complete:</strong> {successCount} succeeded,{" "}
                  {failureCount} failed
                </Typography>
              </Alert>

              {importResults.success && importResults.success.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <CheckCircle
                      fontSize="small"
                      color="success"
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />
                    Successfully Created ({successCount})
                  </Typography>
                  <List dense>
                    {importResults.success.slice(0, 5).map((user, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                        />
                      </ListItem>
                    ))}
                    {importResults.success.length > 5 && (
                      <ListItem>
                        <ListItemText
                          secondary={`... and ${importResults.success.length - 5} more`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {importResults.failed && importResults.failed.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    <ErrorIcon
                      fontSize="small"
                      color="error"
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />
                    Failed ({failureCount})
                  </Typography>
                  <List dense>
                    {importResults.failed.map((failure, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={failure.email || failure.name}
                          secondary={failure.error}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isImporting}>
          {importResults ? "Close" : "Cancel"}
        </Button>
        {!importResults && (
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!parsedData || isImporting || errors.length > 0}
            startIcon={
              isImporting && errors.length === 0 ? (
                <CircularProgress size={16} />
              ) : null
            }
          >
            {isImporting && errors.length === 0
              ? "Importing..."
              : errors.length > 0
                ? "Fix Errors to Import"
                : `Import ${parsedData?.length || 0} Users`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVImportDialog;

import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  useMediaQuery,
  useTheme,
  Box,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";
import { ProjectAPI } from "api";
import * as React from "react";
import { useQuery } from "react-query";
import { StyledDialog } from "StyledComponents/StyledDialog";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const ExportDialog = ({ project_id, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [format, setFormat] = React.useState("csv");
  const [collections, setCollections] = React.useState(["relevant"]);
  const [exportName, setExportName] = React.useState(true);
  const [exportEmail, setExportEmail] = React.useState(true);
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);

  const { data } = useQuery(
    ["fetchDatasetWriter", { project_id }],
    ProjectAPI.fetchDatasetWriter,
    {
      refetchOnWindowFocus: false,
    },
  );

  const handleHelpPopoverOpen = (event) => {
    setAnchorElInfo(event.currentTarget);
  };

  const handleHelpPopoverClose = () => {
    setAnchorElInfo(null);
  };

  const exportDataset = () => {
    ProjectAPI.fetchExportDataset({
      project_id,
      collections,
      format,
      exportName,
      exportEmail,
    }).then(() => {
      onClose();
    });
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      title="Export records"
    >
      <Box sx={{ position: "absolute", top: 12, right: 12 }}>
        <IconButton size="small" onClick={handleHelpPopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
      </Box>
      <Popover
        open={Boolean(anchorElInfo)}
        anchorEl={anchorElInfo}
        onClose={handleHelpPopoverClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 375,
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Exporting Records
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "justify" }}>
              Select which records (relevant, not relevant, not seen) and the
              file format (CSV, Excel, RIS, TSV) for your export.
            </Typography>
            <Divider />
            {window.authentication && (
              <>
                <Typography variant="subtitle1" fontWeight="bold">
                  Privacy
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "justify" }}>
                  Including reviewer names and emails in the export file
                  contains personal data. Ensure you have a legitimate basis for
                  processing and storing this information according to
                  applicable privacy regulations (e.g., GDPR).
                </Typography>
              </>
            )}
            <Box sx={{ mt: 1 }}>
              <Button
                href="https://asreview.readthedocs.io/en/latest/project_export.html"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Learn more
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
      <DialogContent>
        <FormControl
          component="fieldset"
          onChange={(event) => {
            if (event.target.checked) {
              setCollections([...collections, event.target.name]);
            } else {
              setCollections(
                collections.filter((value) => value !== event.target.name),
              );
            }
          }}
        >
          <FormLabel component="legend">Select records to export</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="Relevant"
              name="relevant"
              checked={collections.includes("relevant")}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Not relevant"
              name="irrelevant"
              checked={collections.includes("irrelevant")}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Not seen (yet)"
              name="not_seen"
              checked={collections.includes("not_seen")}
            />
          </FormGroup>
        </FormControl>

        <Divider sx={{ my: "1.5rem" }} />

        <FormControl fullWidth>
          <InputLabel id="export-format-select-label">
            Export file format
          </InputLabel>
          <Select
            labelId="export-format-select-label"
            id="export-format-select"
            value={format}
            label="Export file format"
            onChange={(event) => {
              setFormat(event.target.value);
            }}
          >
            {data?.result.map((value, index) => {
              return (
                <MenuItem
                  key={index}
                  value={value.name}
                  disabled={!value.enabled}
                >
                  {value.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <Divider sx={{ my: "1.5rem" }} />

        {window.authentication && (
          <Stack orientation="vertical" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={exportName}
                  onChange={(event) => setExportName(event.target.checked)}
                />
              }
              label="Include name(s) of reviewer(s)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={exportEmail}
                  onChange={(event) => setExportEmail(event.target.checked)}
                />
              }
              label="Include email(s) of reviewer(s)"
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={exportDataset}>Export</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ExportDialog;

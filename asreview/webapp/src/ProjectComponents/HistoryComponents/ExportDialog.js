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
} from "@mui/material";
import { ProjectAPI } from "api";
import * as React from "react";
import { useQuery } from "react-query";
import { StyledDialog } from "StyledComponents/StyledDialog";

const ExportDialog = ({ project_id, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [format, setFormat] = React.useState("csv");
  const [subset, setSubset] = React.useState(["relevant"]);
  const [exportName, setExportName] = React.useState(true);
  const [exportEmail, setExportEmail] = React.useState(true);

  const { data } = useQuery(
    ["fetchDatasetWriter", { project_id }],
    ProjectAPI.fetchDatasetWriter,
    {
      refetchOnWindowFocus: false,
    },
  );

  const exportDataset = () => {
    ProjectAPI.fetchExportDataset({
      project_id,
      collections: subset,
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
      <DialogContent>
        <FormControl
          component="fieldset"
          onChange={(event) => {
            if (event.target.checked) {
              setSubset([...subset, event.target.name]);
            } else {
              setSubset(subset.filter((value) => value !== event.target.name));
            }
          }}
        >
          <FormLabel component="legend">Select records to export</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="Relevant"
              name="relevant"
              checked={subset.includes("relevant")}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Not relevant"
              name="irrelevant"
              checked={subset.includes("irrelevant")}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Not seen (yet)"
              name="not_seen"
              checked={subset.includes("not_seen")}
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
              label="Include name of reviewer"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={exportEmail}
                  onChange={(event) => setExportEmail(event.target.checked)}
                />
              }
              label="Include email of reviewer"
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

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { ProjectAPI } from "api";
import * as React from "react";
import { useQuery } from "react-query";

const ExportDialog = ({ project_id, open, onClose }) => {
  const [format, setFormat] = React.useState("csv");
  const [collections, setCollections] = React.useState(["relevant"]);
  const [exportUserInfo, setExportUserInfo] = React.useState(true);

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
      collections,
      format,
      user: exportUserInfo,
    }).then((response) => {
      onClose();
    });
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Export records</DialogTitle>
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
          <FormLabel component="legend">Select subset(s) to export</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="My collection"
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
          <FormControlLabel
            control={
              <Switch
                checked={exportUserInfo}
                onChange={(event) => setExportUserInfo(event.target.checked)}
              />
            }
            label="Export name and email of reviewer"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={exportDataset}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;

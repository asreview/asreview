import {
  Button,
  Checkbox,
  Chip,
  Container,
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
  Stack,
  Toolbar,
} from "@mui/material";
import { ProjectAPI } from "api";
import * as React from "react";
import { useQuery } from "react-query";

import { DownloadOutlined } from "@mui/icons-material";
import { useToggle } from "hooks/useToggle";
import { useParams } from "react-router-dom";
import { Filter, LabeledRecord } from ".";

const ExportButton = ({ project_id }) => {
  const [open, toggleOpen] = useToggle();

  const [format, setFormat] = React.useState("csv");
  const [collections, setCollections] = React.useState(["relevant"]);

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
    }).then((response) => {
      toggleOpen();
    });
  };
  return (
    <>
      <Button
        onClick={toggleOpen}
        startIcon={<DownloadOutlined />}
        sx={{ float: "right" }}
      >
        Export
      </Button>
      <Dialog open={open} onClose={toggleOpen}>
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
                label="Not interested"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOpen}>Cancel</Button>
          <Button onClick={exportDataset}>Export</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const LabelHistory = ({
  n_prior_inclusions = null,
  n_prior_exclusions = null,
  showFilter = true,
  filterQuery = [],
  showExport = true,
}) => {
  const { project_id } = useParams();

  const [label, setLabel] = React.useState("relevant");
  const [state, setState] = React.useState(filterQuery);

  return (
    <>
      <Container maxWidth="md">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2}>
            <Chip
              label={
                !n_prior_inclusions
                  ? "My collection"
                  : `My collection (${n_prior_inclusions})`
              }
              color="primary"
              variant={label !== "relevant" ? "outlined" : "filled"}
              onClick={() => {
                setLabel("relevant");
              }}
            />
            <Chip
              label={
                !n_prior_exclusions
                  ? "Not interested"
                  : `Not interested (${n_prior_exclusions})`
              }
              color="primary"
              variant={label !== "irrelevant" ? "outlined" : "filled"}
              onClick={() => {
                setLabel("irrelevant");
              }}
            />
            <Chip
              label={"All labeled"}
              color="primary"
              variant={label !== "all" ? "outlined" : "filled"}
              onClick={() => {
                setLabel("all");
              }}
            />
          </Stack>
          {showExport && <ExportButton project_id={project_id} />}
        </Toolbar>
      </Container>
      <Divider />
      {showFilter && (
        <>
          <Container maxWidth="md">
            <Filter filterQuery={state} setFilterQuery={setState} />
          </Container>
          <Divider />
        </>
      )}
      <Container maxWidth="md" sx={{ my: 3 }}>
        <LabeledRecord
          project_id={project_id}
          label={label}
          filterQuery={state}
        />
      </Container>
    </>
  );
};

export default LabelHistory;

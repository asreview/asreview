import {
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import * as React from "react";

import { FileDownloadOutlined } from "@mui/icons-material";
import { useToggle } from "hooks/useToggle";
import { useParams } from "react-router-dom";
import { ExportDialog, Filter, LabeledRecord } from ".";

const LabelHistory = ({
  mode = "oracle",
  n_prior_inclusions = null,
  n_prior_exclusions = null,
  showFilter = true,
  filterQuery = [],
  showExport = true,
}) => {
  const { project_id } = useParams();
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [open, toggleOpen] = useToggle();

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
                  ? "Not relevant"
                  : `Not relevant (${n_prior_exclusions})`
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
          {showExport && (
            <>
              {mobileScreen && (
                <IconButton
                  onClick={toggleOpen}
                  sx={{ float: "right" }}
                  color="inherit"
                >
                  <FileDownloadOutlined />
                </IconButton>
              )}
              {!mobileScreen && (
                <Button
                  onClick={toggleOpen}
                  startIcon={<FileDownloadOutlined />}
                  sx={{ float: "right" }}
                >
                  Export
                </Button>
              )}
              <ExportDialog
                project_id={project_id}
                open={open}
                onClose={toggleOpen}
              />
            </>
          )}
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
          mode={mode}
          label={label}
          filterQuery={state}
        />
      </Container>
    </>
  );
};

export default LabelHistory;

import { Box, Button, Stack, Tooltip } from "@mui/material";
import "App.css";
import { ActionsFeedbackBar, PageHeader, InteractionButtons } from "Components";
import { ProjectAPI } from "api";
import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

const ExportPage = (props) => {
  const { project_id } = useParams();

  const queryClient = useQueryClient();

  const [exporting, setExporting] = React.useState(false);

  const exportProjectQuery = useQuery(
    ["fetchExportProject", { project_id, project_title: props.info["name"] }],
    ProjectAPI.fetchExportProject,
    {
      enabled: exporting,
      refetchOnWindowFocus: false,
      onSettled: () => setExporting(false),
    },
  );

  const selectedQuery = () => {
    return [exportProjectQuery, "fetchExportProject"];
  };

  const onClickExport = () => {
    setExporting(true);
  };

  const disableExportButton = () => {
    return exporting || props.isSimulating;
  };

  const resetQueries = () => {
    queryClient.resetQueries(selectedQuery()[1]);
  };

  return (
    <>
      <Box>
        <PageHeader header="Export" mobileScreen={props.mobileScreen} />
        <Box className="main-page-body-wrapper">
          <Stack className="main-page-body" spacing={3}>
            <Box className="main-page-body-wrapper" sx={{ mb: "300px" }}>
              <Tooltip
                disableFocusListener={!props.isSimulating}
                disableHoverListener={!props.isSimulating}
                disableTouchListener={!props.isSimulating}
                title="Export after simulation is finished"
              >
                <span>
                  <Button
                    disabled={disableExportButton()}
                    onClick={onClickExport}
                  >
                    {!exporting ? "Export" : "Exporting..."}
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <InteractionButtons project_id={project_id} />
          </Stack>
        </Box>
      </Box>
      {selectedQuery() && (
        <ActionsFeedbackBar
          feedback="Successfully exported the file"
          open={selectedQuery()[0].isSuccess}
          onClose={resetQueries}
        />
      )}
      {selectedQuery() && selectedQuery()[0].isError && (
        <ActionsFeedbackBar
          feedback={selectedQuery()[0].error?.message + " Please try again."}
          open={selectedQuery()[0].isError}
          onClose={resetQueries}
        />
      )}
    </>
  );
};

export default ExportPage;

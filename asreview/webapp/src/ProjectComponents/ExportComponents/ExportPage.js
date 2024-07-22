import {
  Diversity3,
  Email,
  LibraryBooks,
  Payment,
  StarBorder,
} from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import "App.css";
import { ActionsFeedbackBar, CiteDialog, PageHeader } from "Components";
import { MouseOverPopover } from "StyledComponents/StyledPopover";
import { ProjectAPI } from "api";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

const selectWidth = 310;

const PREFIX = "ExportPage";

const classes = {
  select: `${PREFIX}-select`,
  selectHeight: `${PREFIX}-select-height`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.select}`]: {
    width: selectWidth,
  },

  [`& .${classes.selectHeight}`]: {
    height: 86,
  },
}));

const StyledActionsBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  flexDirection: "row", // Always set to row
}));

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

  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleDialog = () => {
    setDialogOpen((prev) => !prev);
  };

  return (
    <Root aria-label="export page">
      <Box>
        <PageHeader header="Export" mobileScreen={props.mobileScreen} />
        <Box className="main-page-body-wrapper">
          <Stack className="main-page-body" spacing={3}>
            <Box className="main-page-body-wrapper">
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
            <StyledActionsBox>
              <Box
                sx={{
                  maxWidth: { xs: "60%", sm: "40%", md: "30%" },
                  width: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", paddingBottom: "10px" }}
                >
                  Love using ASReview LAB?
                </Typography>
                <Stack
                  spacing={2}
                  sx={{
                    justifyContent: "center",
                    width: "164px",
                    margin: "auto",
                    textAlign: "center",
                  }}
                >
                  <Button
                    startIcon={<LibraryBooks />}
                    variant="outlined"
                    color="primary"
                    onClick={toggleDialog}
                  >
                    Cite
                  </Button>
                  <CiteDialog
                    isOpen={dialogOpen}
                    onClose={toggleDialog}
                    asreview_version={window.asreviewVersion}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://github.com/asreview/asreview"
                    startIcon={<StarBorder />}
                  >
                    Star
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://asreview.nl/donate"
                    startIcon={<Payment />}
                  >
                    Donate
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://asreview.ai/newsletter/subscribe"
                    startIcon={<Email />}
                  >
                    Subscribe
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://asreview.nl/community"
                    startIcon={<Diversity3 />}
                  >
                    Contribute
                  </Button>
                </Stack>
              </Box>
            </StyledActionsBox>
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
    </Root>
  );
};

export default ExportPage;

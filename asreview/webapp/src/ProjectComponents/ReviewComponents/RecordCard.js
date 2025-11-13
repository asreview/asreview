import {
  Link as LinkIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Collapse,
  Dialog,
  Divider,
  Fade,
  Grid2 as Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";

import { StyledIconButton } from "StyledComponents/StyledButton";
import { useToggle } from "hooks/useToggle";
import { RecordCardLabeler, RecordCardModelTraining } from ".";

import { fontSizeOptions } from "globals.js";

const RecordCardContent = ({
  record,
  fontSize,
  collapseAbstract,
  labelerProps,
}) => {
  const [readMoreOpen, toggleReadMore] = useToggle();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [iframeLoading, setIframeLoading] = React.useState(true);
  const [iframeSrc, setIframeSrc] = React.useState(null);

  const handleOpenDialog = () => {
    setIframeLoading(true);
    setDialogOpen(true);
    (async () => {
      const fallbackUrl = record.url ? record.url : doiUrl;
      setIframeSrc(fallbackUrl);
      if (record.doi) {
        const apiUrl = `${window.api_url}api/oa/get_url?doi=${encodeURIComponent(
          record.doi,
        )}`;
        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            credentials: "include",
          });
          if (response.ok) {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/pdf")) {
              setIframeSrc(response.url);
            } else if (contentType.includes("application/json")) {
              const data = await response.json();
              if (data.html_url) {
                setIframeSrc(data.html_url);
              }
            }
          }
        } catch (error) {
          console.warn("Failed to get Open Access URL:", error);
        }
      }
    })();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getDoiUrl = (doi) => {
    if (!doi) return "";
    try {
      new URL(doi);
      return doi;
    } catch {
      return `https://doi.org/${doi}`;
    }
  };

  const doiUrl = getDoiUrl(record.doi);
  const primaryLinkUrl = record.url ? record.url : doiUrl;

  return (
    <React.Fragment>
      <CardContent aria-label="record title abstract" sx={{ m: 1 }}>
        <Stack spacing={2}>
          {/* Show the title */}
          <Typography
            variant={"h5"}
            sx={(theme) => ({
              fontWeight: theme.typography.fontWeightMedium,
              lineHeight: 1.4,
            })}
          >
            {/* No title, inplace text */}
            {(record.title === "" || record.title === null) && (
              <Box
                className={"fontSize" + fontSizeOptions[fontSize]}
                fontStyle="italic"
              >
                No title available
              </Box>
            )}

            {!(record.title === "" || record.title === null) && (
              <Box className={"fontSize" + fontSizeOptions[fontSize]}>
                {record.title}
              </Box>
            )}
          </Typography>
          <Divider />
          <Stack direction="row" spacing={1}>
            {(record.doi || record.url) && (
              <Tooltip title="View full text">
                <StyledIconButton
                  className="record-card-icon"
                  onClick={handleOpenDialog}
                >
                  <VisibilityIcon />
                </StyledIconButton>
              </Tooltip>
            )}

            {record.url && (
              <Tooltip title="Open URL">
                <StyledIconButton
                  className="record-card-icon"
                  href={record.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkIcon />
                </StyledIconButton>
              </Tooltip>
            )}
          </Stack>
          <Box>
            {(record.abstract === "" || record.abstract === null) && (
              <Typography
                className={"fontSize" + fontSize}
                variant="body1"
                sx={{
                  fontStyle: "italic",
                  textAlign: "justify",
                }}
              >
                No abstract available
              </Typography>
            )}

            <Typography
              className={"fontSize" + fontSizeOptions[fontSize]}
              variant="body1"
              sx={{
                whiteSpace: "pre-line",
                textAlign: "justify",
                hyphens: "auto",
                lineHeight: 1.6,
              }}
            >
              {!(record.abstract === "" || record.abstract === null) &&
              collapseAbstract &&
              record.abstract.length > 500 ? (
                <>
                  {!readMoreOpen ? (
                    <>
                      {record.abstract.substring(0, 500)}...
                      <Button
                        onClick={toggleReadMore}
                        startIcon={<ExpandMoreIcon />}
                        color="primary"
                        sx={{ textTransform: "none" }}
                      >
                        show more
                      </Button>
                    </>
                  ) : (
                    <>
                      {record.abstract}
                      <Button
                        onClick={toggleReadMore}
                        startIcon={<ExpandLessIcon />}
                        color="primary"
                        sx={{ textTransform: "none" }}
                      >
                        show less
                      </Button>
                    </>
                  )}
                </>
              ) : (
                record.abstract
              )}
            </Typography>
          </Box>
          {record.keywords && (
            <Box sx={{ pt: 1 }}>
              <Typography sx={{ color: "text.secondary", fontWeight: "bold" }}>
                {record.keywords.map((keyword, index) => (
                  <span key={index}>
                    {index > 0 && " • "}
                    {keyword}
                  </span>
                ))}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
      <Dialog
        onClose={handleCloseDialog}
        open={dialogOpen}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            height: "95vh",
            width: "95vw",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#fff",
          },
        }}
      >
        <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
          <Box
            sx={{
              flexGrow: 1,
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                p: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "#fff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={primaryLinkUrl}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          {iframeLoading && (
                            <CircularProgress size={16} thickness={5} />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        color: "black",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "black",
                        },
                      },
                    }}
                  />
                </Box>
                <Tooltip title="Open link in a new tab">
                  <IconButton
                    aria-label="open in new tab"
                    onClick={() =>
                      window.open(
                        primaryLinkUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    size="small"
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box
              sx={{
                position: "relative",
                flexGrow: 1,
                overflow: "hidden",
                bgcolor: "#fff",
              }}
            >
              <iframe
                onLoad={() => setIframeLoading(false)}
                onError={() => setIframeLoading(false)}
                src={iframeSrc || primaryLinkUrl}
                title={record.title}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  visibility: iframeLoading ? "hidden" : "visible",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={(theme) => ({
              width: 400,
              height: "100%",
              overflowY: "auto",
              bgcolor: theme.palette.background.paper,
            })}
          >
            <RecordCardLabeler {...labelerProps} compact />
          </Box>
        </Box>
      </Dialog>
    </React.Fragment>
  );
};

const RecordCard = ({
  project_id,
  record,
  afterDecision = null,
  retrainAfterDecision = true,
  showBorder = true,
  fontSize = 1,
  modelLogLevel = "warning",
  showNotes = true,
  collapseAbstract = false,
  hotkeys = false,
  transitionType = "fade",
  transitionSpeed = { enter: 500, exit: 100 },
  landscape = false,
  changeDecision = true,
}) => {
  const [open, setOpen] = React.useState(true);

  const [tags, setTags] = React.useState(null);

  React.useEffect(() => {
    let stateData = record.state?.tags
      ? structuredClone(record.state.tags)
      : structuredClone(record.tags_form);

    // Reconciles the record's saved tags with current project settings to prevent crashes.
    if (record.tags_form) {
      record.tags_form.forEach((formGroup) => {
        let stateGroup = stateData.find((g) => g.id === formGroup.id);
        if (!stateGroup) {
          stateData.push(structuredClone(formGroup));
        } else {
          formGroup.values.forEach((formValue) => {
            let stateValue = stateGroup.values.find(
              (v) => v.id === formValue.id,
            );
            if (!stateValue) {
              stateGroup.values.push(structuredClone(formValue));
            }
          });
        }
      });
    }

    setTags(stateData);
  }, [record.record_id, record.tags_form, record.state?.tags]);

  const handleTagsChange = (newTags) => {
    setTags(newTags);
  };

  if (!tags && record.tags_form) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={100}
      >
        <CircularProgress />
      </Box>
    );
  }

  const labelerProps = {
    project_id: project_id,
    record_id: record.record_id,
    label: record.state?.label,
    labelFromDataset: record.included,
    onDecisionClose: transitionType ? () => setOpen(false) : afterDecision,
    retrainAfterDecision: retrainAfterDecision,
    note: record.state?.note,
    labelTime: record.state?.time,
    user: record.state?.user,
    showNotes: showNotes,
    tagsForm: record.tags_form,
    tagValues: tags,
    onTagChange: handleTagsChange,
    landscape: landscape,
    hotkeys: hotkeys,
    changeDecision: changeDecision,
  };

  const styledRepoCard = (
    <Box>
      <RecordCardModelTraining
        key={"record-card-model-" + project_id + "-" + record?.record_id}
        record={record}
        modelLogLevel={modelLogLevel}
        sx={{ mb: 3 }}
      />
      <Card
        elevation={showBorder ? 4 : 0}
        sx={(theme) => ({
          bgcolor: theme.palette.background.record,
          borderRadius: !showBorder ? 0 : undefined,
        })}
      >
        <Grid
          container
          columns={5}
          sx={{ alignItems: "stretch" }}
          // divider={<Divider orientation="vertical" flexItem />}
        >
          <Grid size={landscape ? 3 : 5}>
            <RecordCardContent
              record={record}
              fontSize={fontSize}
              collapseAbstract={collapseAbstract}
              labelerProps={labelerProps}
            />
          </Grid>
          <Grid size={landscape ? 2 : 5}>
            <RecordCardLabeler {...labelerProps} />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );

  if (transitionType === "fade") {
    return (
      <Fade
        in={open}
        timeout={transitionSpeed}
        onExited={afterDecision}
        unmountOnExit
      >
        {styledRepoCard}
      </Fade>
    );
  } else if (transitionType === "collapse") {
    return (
      <Collapse
        in={open}
        timeout={transitionSpeed}
        onExited={afterDecision}
        unmountOnExit
      >
        {styledRepoCard}
      </Collapse>
    );
  } else {
    return styledRepoCard;
  }
};

export default RecordCard;

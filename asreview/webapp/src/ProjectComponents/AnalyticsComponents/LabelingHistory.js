import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  Stack,
  Box,
  Skeleton,
  Typography,
  FormControlLabel,
  Switch,
  useTheme,
  Popover,
  IconButton,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const sortPerChunk = (decisions, chunkSize) => {
  const sorted = [];
  for (let i = 0; i < decisions.length; i += chunkSize) {
    const chunk = decisions
      .slice(i, i + chunkSize)
      .sort((a, b) => b.label - a.label);
    sorted.push(...chunk);
  }
  return sorted;
};

const generateLines = (
  total,
  decisions,
  chronological,
  chunkSize,
  handleClick,
  theme,
) => {
  const lines = [];
  const sortedDecisions = chronological
    ? decisions
    : sortPerChunk(decisions, chunkSize);

  for (let i = 0; i < total; i++) {
    const color =
      i < sortedDecisions.length
        ? sortedDecisions[i].label === 1
          ? theme.palette.primary.main // Relevant
          : sortedDecisions[i].label === 0
            ? theme.palette.grey[600] // Irrelevant
            : theme.palette.grey[800] // Not used
        : theme.palette.grey[400]; // No decision yet

    lines.push(
      <Box
        key={i}
        sx={{
          width: theme.spacing(3.15),
          height: theme.spacing(0.625),
          backgroundColor: color,
          borderRadius: 1,
          margin: theme.spacing(0.125),
          cursor: "pointer",
        }}
        onClick={(event) => handleClick(event, i, color)}
      />,
    );
  }
  return lines;
};

const LabelingHistory = ({ genericDataQuery, progressQuery, mobileScreen }) => {
  const theme = useTheme();
  const [chronological, setChronological] = useState(true);
  const [chunkSize, setChunkSize] = useState(30);
  const [anchorEl, setAnchorEl] = useState(null);
  const [infoAnchorEl, setInfoAnchorEl] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedColor, setSelectedColor] = useState(theme.palette.grey[400]);
  const containerRef = useRef(null);

  const handleSwitchChange = () => {
    setChronological(!chronological);
  };

  const handleClick = (event, index, color) => {
    setAnchorEl(event.currentTarget);
    setSelectedPaper(index);
    setSelectedColor(color);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedPaper(null);
  };

  const handleInfoClick = (event) => {
    setInfoAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setInfoAnchorEl(null);
  };

  const updateChunkSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const itemWidth =
        parseFloat(theme.spacing(3.15)) + parseFloat(theme.spacing(0.25));
      const newChunkSize = Math.floor(containerWidth / itemWidth);
      setChunkSize(newChunkSize);
    }
  }, [theme]);

  useMemo(() => {
    updateChunkSize();
    window.addEventListener("resize", updateChunkSize);
    return () => window.removeEventListener("resize", updateChunkSize);
  }, [updateChunkSize]);

  const totalPapers = progressQuery?.data?.n_papers || 0;
  const labelingChronology = genericDataQuery?.data || [];
  const maxVisibleItems = totalPapers;
  const visibleItems = Math.min(maxVisibleItems, totalPapers);
  const latestDecisions = labelingChronology.slice(-totalPapers);
  const decisionsToDisplay = latestDecisions.slice(-visibleItems);

  const open = Boolean(anchorEl);
  const id = open ? "paper-popover" : undefined;

  const infoOpen = Boolean(infoAnchorEl);
  const infoId = infoOpen ? "info-popover" : undefined;

  return (
    <Box position="relative" width="100%" maxWidth={960}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={genericDataQuery?.error}
        isError={!!genericDataQuery?.isError}
      />
      <Card
        sx={{
          padding: theme.spacing(2, 5),
          borderRadius: 4,
          boxShadow: 3,

          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <CardContent sx={{ padding: theme.spacing(0) }}>
          <Stack spacing={3} width="100%">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={chronological}
                    onChange={handleSwitchChange}
                  />
                }
                label={<Typography variant="body2">Chronological</Typography>}
                labelPlacement="end"
                sx={{
                  fontSize: theme.typography.pxToRem(10),
                }}
              />
            </Box>

            {genericDataQuery?.isLoading ? (
              <Box
                ref={containerRef}
                sx={{
                  width: "100%",
                  height: 180,
                  overflowY: "auto",
                  display: "flex",
                  flexWrap: "wrap",
                  rowGap: theme.spacing(0.5),
                  paddingRight: theme.spacing(0),
                }}
              >
                {Array.from(new Array(chunkSize)).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width={theme.spacing(3.15)}
                    height={theme.spacing(0.625)}
                    sx={{ margin: theme.spacing(0.125) }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                ref={containerRef}
                sx={{
                  width: "100%",
                  height: 180,
                  overflowY: "auto",
                  display: "flex",
                  flexWrap: "wrap",
                  rowGap: theme.spacing(0.5),
                  paddingRight: theme.spacing(1),
                }}
              >
                {generateLines(
                  visibleItems,
                  decisionsToDisplay,
                  chronological,
                  chunkSize,
                  handleClick,
                  theme,
                )}
              </Box>
            )}
            <Box display="flex" justifyContent="center">
              <Typography variant="body2" color="textSecondary">
                Scroll to view more
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              [theme.breakpoints.down("sm")]: {
                top: theme.spacing(2),
                right: theme.spacing(2),
              },
            }}
          >
            <IconButton
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                p: theme.spacing(2.1),
              }}
              onClick={handleInfoClick}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        PaperProps={{
          sx: {
            p: 2,
            maxWidth: 240,
            boxShadow: 3,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        {selectedPaper !== null && (
          <Box p={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Placeholder Title
            </Typography>
            <Typography variant="caption" sx={{ fontStyle: "italic", mb: 1 }}>
              Coming Soon
            </Typography>
            <Typography variant="body2">Placeholder Abstract</Typography>
          </Box>
        )}
      </Popover>
      <Popover
        id={infoId}
        open={infoOpen}
        anchorEl={infoAnchorEl}
        onClose={handleInfoClose}
        PaperProps={{
          sx: {
            p: 3,
            maxWidth: 300,
            boxShadow: 3,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <Box>
          <Typography variant="body2" gutterBottom>
            <strong>Chronological</strong>
          </Typography>
          <Typography variant="body2" gutterBottom>
            In the chronological view, the lines will be sorted in the same
            order you labeled them. Otherwise, they will be sorted by their
            labels.
          </Typography>
          <Typography variant="body2" gutterBottom>
            The arrow of time points to right and down.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Labeling History</strong>
          </Typography>
          <Typography variant="body2" gutterBottom>
            These are your previous labeling decisions. Gold lines represent
            relevant papers, while gray lines represent irrelevant papers. When
            you click on a line, you can view that paper's details.
          </Typography>
          <Box sx={{ pt: 1, textAlign: "center" }}>
            <a
              href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
              style={{
                color: theme.palette.primary.main,
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default LabelingHistory;

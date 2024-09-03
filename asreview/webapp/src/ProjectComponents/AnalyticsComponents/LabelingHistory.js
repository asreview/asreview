import React, { useState, useEffect, useRef, useCallback } from "react";
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
  styled,
  Tooltip,
  IconButton,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { tooltipClasses } from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// Styled component for the main card
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(3, 6, 3, 6),
  borderRadius: 16,
  width: "100%",
  maxWidth: "100%",
  height: "100%",
}));

// Styled component for the container that holds the history items
const HistoryContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "100%",
  height: "300px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  rowGap: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  scrollbarWidth: "thin",
  scrollbarColor: theme.palette.primary.main + " transparent",
}));

// Styled component for individual history items
const HistoryItem = styled(Box)(({ theme, color }) => ({
  width: theme.spacing(3.15),
  height: theme.spacing(0.625),
  backgroundColor: color,
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.125),
  cursor: "pointer",
}));

// Function to sort decisions within chunks
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

// Function to generate the history lines
const generateLines = (
  total,
  decisions,
  chronological,
  chunkSize,
  handleClick,
) => {
  const lines = [];
  const sortedDecisions = chronological
    ? decisions
    : sortPerChunk(decisions, chunkSize);

  for (let i = 0; i < total; i++) {
    const color =
      i < sortedDecisions.length
        ? sortedDecisions[i].label === 1
          ? "#FFD700" // Yellow for relevant
          : sortedDecisions[i].label === 0
            ? "#808080" // Gray for irrelevant
            : "#D3D3D3" // Light gray for neutral
        : "#D3D3D3"; // Default color if no decision

    lines.push(
      <HistoryItem
        key={i}
        color={color}
        onClick={(event) => handleClick(event, i, color)}
      />,
    );
  }
  return lines;
};

const LabelingHistory = ({ genericDataQuery, progressQuery, mobileScreen }) => {
  const [chronological, setChronological] = useState(true);
  const [chunkSize, setChunkSize] = useState(29);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#D3D3D3");
  const containerRef = useRef(null);
  const theme = useTheme();

  const handleSwitchChange = () => {
    setChronological(!chronological);
  };

  const handleClick = (event, index, paperData, color) => {
    setAnchorEl(event.currentTarget);
    setSelectedPaper(paperData);
    setSelectedColor(color);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedPaper(null);
  };

  // Update chunk size based on container width
  const updateChunkSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const itemWidth =
        parseFloat(theme.spacing(3.15)) + parseFloat(theme.spacing(0.25)); // item width + margin
      const newChunkSize = Math.floor(containerWidth / itemWidth);
      setChunkSize(newChunkSize);
    }
  }, [theme]);

  // Update chunk size on mount and window resize
  useEffect(() => {
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
  const id = open ? "popover" : undefined;

  // Info tooltip
  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[1],
      fontSize: theme.typography.pxToRem(12),
      padding: "10px",
      borderRadius: theme.shape.borderRadius,
    },
  }));

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 960 }}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={genericDataQuery?.error}
        isError={!!genericDataQuery?.isError}
      />
      <StyledCard elevation={2}>
        <CardContent style={{ padding: theme.spacing(0) }}>
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
              <HistoryContainer>
                {Array.from(new Array(chunkSize)).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width={theme.spacing(3.15)}
                    height={theme.spacing(0.625)}
                    style={{ margin: theme.spacing(0.125) }}
                  />
                ))}
              </HistoryContainer>
            ) : (
              <HistoryContainer ref={containerRef}>
                {generateLines(
                  visibleItems,
                  decisionsToDisplay,
                  chronological,
                  chunkSize,
                  handleClick,
                )}
              </HistoryContainer>
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
              top: theme.spacing(1),
              right: theme.spacing(1),
              [theme.breakpoints.down("sm")]: {
                top: theme.spacing(2),
                right: theme.spacing(2),
              },
            }}
          >
            <CustomTooltip
              title={
                <React.Fragment>
                  <hr
                    style={{
                      border: `none`,
                      borderTop: `4px solid ${theme.palette.divider}`,
                      margin: "8px 0",
                      borderRadius: "5px",
                    }}
                  />
                  <Typography variant="body2" gutterBottom>
                    <strong>Chronology Switch</strong>
                  </Typography>
                  <li>
                    In the chronological view, the lines will be sorted in the
                    same order you labeled them. Otherwise, they will be sorted
                    by their labels. The arrow of time points to right and down.
                  </li>
                  <hr
                    style={{
                      border: `none`,
                      borderTop: `4px solid ${theme.palette.divider}`,
                      margin: "8px 0",
                      borderRadius: "5px",
                    }}
                  />
                  <Typography variant="body2" gutterBottom>
                    <strong>Labeling History</strong>
                  </Typography>
                  <ul style={{ paddingLeft: "1.5em", margin: 0 }}>
                    <li>
                      These are your previous labeling decisions. Gold lines
                      represent relevant papers, while gray lines represent
                      irrelevant papers.
                    </li>
                    <li>
                      When you click on a line, you can view that paper's
                      details.
                    </li>
                  </ul>
                  <hr
                    style={{
                      border: `none`,
                      borderTop: `4px solid ${theme.palette.divider}`,
                      margin: "8px 0",
                      borderRadius: "5px",
                    }}
                  />
                  <Box sx={{ pt: 1, textAlign: "center" }}>
                    <a
                      href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                      style={{
                        color:
                          theme.palette.mode === "dark" ? "#1E90FF" : "#1E90FF",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn more
                    </a>
                  </Box>
                </React.Fragment>
              }
              arrow
              interactive={true}
              enterTouchDelay={0}
            >
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  p: theme.spacing(2.1),
                }}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </CustomTooltip>
          </Box>
        </CardContent>
      </StyledCard>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {selectedPaper && (
          <Box
            p={2}
            maxWidth={240}
            bgcolor={selectedColor}
            borderRadius={3}
            boxShadow={3}
            sx={{
              color: selectedColor === "#FFD700" ? "#000" : "#FFF",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Placeholder Title
            </Typography>
            <Typography variant="caption" sx={{ fontStyle: "italic" }}>
              Coming Soon
            </Typography>
            <Typography variant="body2" mt={1}>
              Placeholder Abstract
            </Typography>
          </Box>
        )}
      </Popover>
    </div>
  );
};

export default LabelingHistory;

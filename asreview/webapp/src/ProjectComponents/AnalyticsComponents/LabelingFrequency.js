import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Tooltip,
  tooltipClasses,
  CircularProgress,
  Slider,
  IconButton,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { CardErrorHandler } from "Components";

// Styled component for the main card
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  width: "100%",
  maxWidth: 960,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

// Styled component for the tooltip
const StyledTooltip = styled(({ className, ...props }) => (
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
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}));

const LabelingFrequency = ({ genericDataQuery, progressQuery }) => {
  const [sliderValue, setSliderValue] = useState(30);
  const canvasRef = useRef(null);

  const theme = useTheme();

  const totalPapers = progressQuery?.data?.n_papers || 0;
  const progressDensity = genericDataQuery?.data || [];

  // Reverse the dataset to show the latest labels first
  const reversedDecisions = progressDensity.slice(-totalPapers).reverse();

  // Exponential scaling for visible records
  const minVisibleRecords = 10; // Minimum records when slider is at 0%
  const maxVisibleRecords = totalPapers; // Maximum records when silder is at 100%

  // Exponential function for user-friendly scaling
  const visibleCount =
    sliderValue === 100
      ? maxVisibleRecords
      : Math.max(
          minVisibleRecords,
          Math.ceil(
            minVisibleRecords *
              Math.pow(
                maxVisibleRecords / minVisibleRecords,
                sliderValue / 100,
              ),
          ),
        );

  // Slice the dataset to get the visible records
  const decisionsToDisplay = reversedDecisions.slice(0, visibleCount);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const lineWidth = 10;
      const fullHeight = canvasRef.current.height;
      const lineHeight = fullHeight * 0.7;
      const canvasWidth = canvasRef.current.width;
      const totalVisible = decisionsToDisplay.length;

      decisionsToDisplay.forEach((decision, index) => {
        ctx.fillStyle =
          decision.label === 1
            ? theme.palette.mode === "light"
              ? theme.palette.primary.light
              : theme.palette.primary.main // Relevant
            : theme.palette.mode === "light"
              ? "#808080"
              : theme.palette.grey[600]; // Irrelevant

        ctx.beginPath();
        const x = canvasWidth - ((index + 1) / totalVisible) * canvasWidth; // Start drawing from right to left
        ctx.roundRect(
          x - lineWidth, // Adjust x to account for line width
          (fullHeight - lineHeight) / 2, // Center the line vertically
          lineWidth,
          lineHeight,
          5, // Rounded corners
        );
        ctx.fill();
      });
    }
  }, [
    decisionsToDisplay,
    sliderValue,
    theme.palette.grey,
    theme.palette.mode,
    theme.palette.primary.light,
    theme.palette.primary.main,
  ]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  return (
    <StyledCard elevation={2}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
          position="relative"
        >
          <Typography variant="h6" fontWeight="bold"></Typography>
          <Box
            sx={{
              position: "absolute",
              top: "-12px",
              right: "-12px",
            }}
          >
            <StyledTooltip
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
                    <strong>Labeling Frequency</strong>
                  </Typography>
                  <ul style={{ paddingLeft: "1.5em", margin: 0 }}>
                    <li>
                      These are your previous labeling decisions. Your most
                      recent decisions are on the right side.
                    </li>
                    <li>
                      Gold lines represent relevant papers, while gray lines
                      represent irrelevant papers.
                    </li>
                    <li>
                      You can use the slider to zoom in and out on your labeling
                      decisions.
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
              <IconButton size="small">
                <HelpOutlineIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
              </IconButton>
            </StyledTooltip>
          </Box>
        </Box>
        <CardErrorHandler
          queryKey={"fetchGenericData"}
          error={genericDataQuery?.error}
          isError={!!genericDataQuery?.isError}
        />
        {genericDataQuery?.isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Box mb={1}>
              <canvas
                ref={canvasRef}
                width={900}
                height={315}
                style={{
                  width: "100%",
                  height: 315,
                  backgroundColor: "transparent",
                }}
              />
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Box flexGrow={1}>
                <Slider
                  value={sliderValue}
                  onChange={handleSliderChange}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                  min={0}
                  max={100}
                  step={1}
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
              <Typography variant="body2" ml={2}>
                Showing {decisionsToDisplay.length} of{" "}
                {reversedDecisions.length} labels
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default LabelingFrequency;

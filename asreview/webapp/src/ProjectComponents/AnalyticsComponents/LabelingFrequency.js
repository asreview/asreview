import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  CircularProgress,
  Slider,
  IconButton,
  Popover,
  useTheme,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { CardErrorHandler } from "Components";

const LabelingFrequency = ({ genericDataQuery, progressQuery }) => {
  const [sliderValue, setSliderValue] = useState(30);
  const [anchorEl, setAnchorEl] = useState(null);
  const canvasRef = useRef(null);
  const theme = useTheme();

  const totalPapers = progressQuery?.data?.n_records || 0;
  const progressDensity = genericDataQuery?.data || [];
  const reversedDecisions = progressDensity.slice(-totalPapers).reverse();

  const minVisibleRecords = 10;
  const maxVisibleRecords = totalPapers;

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
              ? theme.palette.grey[600]
              : theme.palette.grey[600]; // Irrelevant

        ctx.beginPath();
        const x = canvasWidth - ((index + 1) / totalVisible) * canvasWidth;
        ctx.roundRect(
          x - lineWidth,
          (fullHeight - lineHeight) / 2,
          lineWidth,
          lineHeight,
          5,
        );
        ctx.fill();
      });
    }
  }, [decisionsToDisplay, sliderValue, theme]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);

  return (
    <Card
      sx={{
        position: "relative",
      }}
    >
      <CardContent>
        <Box>
          <IconButton size="small" onClick={handlePopoverOpen}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
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
            <Box>
              <canvas
                ref={canvasRef}
                width={900}
                height={315}
                style={{
                  width: "100%",
                  height: 219,
                  bgcolor: "transparent",
                }}
              />
            </Box>
            <Box display="flex" alignItems="center">
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
      <Popover
        id="info-popover"
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
      >
        <Box>
          <Typography variant="body2" gutterBottom>
            <strong>Labeling Frequency</strong>
          </Typography>

          <Typography variant="body2" gutterBottom>
            These are your previous labeling decisions. Your most recent
            decisions are on the right side.
          </Typography>

          <Typography variant="body2" gutterBottom>
            Gold lines represent relevant records, while gray lines represent
            irrelevant records.
          </Typography>

          <Typography variant="body2" gutterBottom>
            You can use the slider to zoom in and out on your labeling
            decisions.
          </Typography>
          <Box>
            <a
              href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </Box>
        </Box>
      </Popover>
    </Card>
  );
};

export default LabelingFrequency;

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Slider,
  IconButton,
  Popover,
  useTheme,
  Skeleton,
  Link,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { CardErrorHandler } from "Components";
import { useQuery } from "react-query";
import { ProjectAPI } from "api";

const LabelingFrequency = ({ project_id }) => {
  const [sliderValue, setSliderValue] = useState(50);
  const [anchorEl, setAnchorEl] = useState(null);
  const canvasRef = useRef(null);
  const theme = useTheme();

  const progressQuery = useQuery(
    ["fetchProgress", { project_id }],
    ({ queryKey }) => ProjectAPI.fetchProgress({ queryKey }),
    { refetchOnWindowFocus: false },
  );

  const genericDataQuery = useQuery(
    ["fetchGenericData", { project_id }],
    ({ queryKey }) => ProjectAPI.fetchGenericData({ queryKey }),
    { refetchOnWindowFocus: false },
  );

  const totalPapers = progressQuery?.data?.n_records || 0;
  const progressDensity = genericDataQuery?.data || [];
  const reversedDecisions = progressDensity.slice(-totalPapers).reverse();

  const minVisibleRecords = 10;
  const maxVisibleRecords = reversedDecisions.length;
  const visibleCount = Math.floor(
    minVisibleRecords *
      Math.pow(maxVisibleRecords / minVisibleRecords, sliderValue / 100),
  );

  const decisionsToDisplay = reversedDecisions.slice(0, visibleCount);

  useEffect(() => {
    if (canvasRef.current && decisionsToDisplay.length > 0) {
      const ctx = canvasRef.current.getContext("2d");
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const totalVisible = decisionsToDisplay.length;
      const gap = 1;
      const barWidth = Math.max(
        (canvasWidth - gap * (totalVisible - 1)) / totalVisible,
        1,
      );
      const barHeight = canvasHeight * 0.8;

      decisionsToDisplay.forEach((decision, index) => {
        ctx.fillStyle =
          decision.label === 1
            ? theme.palette.mode === "light"
              ? theme.palette.grey[600]
              : theme.palette.grey[600] // Relevant
            : theme.palette.primary.main; // Irrelevant

        const x = canvasWidth - (index + 1) * (barWidth + gap);
        const y = (canvasHeight - barHeight) / 2;
        const radius = 7;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(
          x + barWidth,
          y + barHeight,
          x + barWidth - radius,
          y + barHeight,
        );
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
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
        backgroundColor: "transparent",
      }}
    >
      <CardContent>
        <Box>
          <IconButton size="small" onClick={handlePopoverOpen}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
        <CardErrorHandler
          queryKey={"fetchGenericData and fetchProgress"}
          error={genericDataQuery?.error || progressQuery?.error}
          isError={!!genericDataQuery?.isError || !!progressQuery?.isError}
        />
        {genericDataQuery?.isLoading || progressQuery?.isLoading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : (
          <>
            <Box>
              <canvas
                ref={canvasRef}
                width={900}
                height={200}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
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
        <Box p={2}>
          <Typography variant="body1" gutterBottom>
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
            <Link
              href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Link>
          </Box>
        </Box>
      </Popover>
    </Card>
  );
};

export default LabelingFrequency;

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
  background: "#222222",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}));

// Styled Tooltip
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    maxWidth: 300,
    fontSize: theme.typography.pxToRem(12),
    border: `1px solid ${theme.palette.divider}`,
  },
}));

// Mock data generation function
const generateMockData = (total_count = 50000, relevant_count = 13000) => {
  const data = [];
  let current_relevant = 0;

  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  for (let i = 0; i < total_count; i++) {
    const x = 10 * (i / total_count) - 5;
    const prob_relevant = 0.4 * (1 - sigmoid(x)) + 0.01;

    if (Math.random() < prob_relevant && current_relevant < relevant_count) {
      data.push({ Label: 1 });
      current_relevant++;
    } else {
      data.push({ Label: 0 });
    }
  }

  return data;
};

// Paper titles and abstracts for the tooltips
const generatePaperData = (number) => {
  const titles = [
    "Ketorolac versus meperidine: ED treatment of severe musculoskeletal low back pain",
    "Randomised double-blind active-placebo-controlled crossover trial of intravenous fentanyl in neuropathic pain",
    "Acute pain services in Europe: a 17-nation survey of 105 hospitals",
    "Serotonin syndrome with fluoxetine plus tramadol",
    "Drugs from the deep: marine natural products as drug candidates",
    "Chronic pain after spinal cord injury: a survey of practice in UK spinal injury units",
    "Analysis of Pain Management in Critically Ill Patients",
    "Quality of Life Improvement after Videothoracoscopic Splanchnicectomy in Chronic Pancreatitis Patients: Case Control Study",
  ];

  const abstracts = [
    "A comparative study on the efficacy of Ketorolac versus Meperidine in treating severe musculoskeletal low back pain in the emergency department.",
    "A clinical trial evaluating the effects of intravenous fentanyl on neuropathic pain, using a double-blind active-placebo-controlled crossover design.",
    "A comprehensive survey across 105 hospitals in 17 European nations, assessing the availability and practices of acute pain services.",
    "A case report highlighting the incidence of serotonin syndrome in patients concurrently using fluoxetine and tramadol.",
    "An exploration of marine natural products and their potential as novel drug candidates in various therapeutic areas.",
    "An investigation into chronic pain management practices within UK spinal injury units, focusing on post-spinal cord injury patients.",
    "An analysis of pain management strategies and outcomes in critically ill patients, focusing on the efficacy and challenges.",
    "A case-control study demonstrating the quality of life improvements in chronic pancreatitis patients following videothoracoscopic splanchnicectomy.",
  ];

  return {
    title: titles[number % titles.length],
    abstract: abstracts[number % abstracts.length],
  };
};

const AlternativeHistoryBar = () => {
  const [sliderValue, setSliderValue] = useState(30);
  const canvasRef = useRef(null);
  const [mockData, setMockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate the mock data
    const data = generateMockData();
    setMockData(data);
    setIsLoading(false);
  }, []);

  const totalPapers = mockData.length;
  const reversedDecisions = mockData.slice(-totalPapers).reverse();

  // Exponential scaling for visible records
  const minVisibleRecords = 5; // Minimum records when slider is at 0%
  const maxVisibleRecords = totalPapers; // Maximum records

  // Smooth exponential function to map slider value to visible record count
  const visibleCount = sliderValue === 100
    ? maxVisibleRecords
    : Math.max(
        minVisibleRecords,
        Math.ceil(
          minVisibleRecords * Math.pow(maxVisibleRecords / minVisibleRecords, sliderValue / 100)
        )
    );

  // Slice the dataset to get the visible records
  const decisionsToDisplay = reversedDecisions.slice(0, visibleCount);

  useEffect(() => {
    if (canvasRef.current && decisionsToDisplay.length > 0) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const fullWidth = canvasRef.current.width;
      const fullHeight = canvasRef.current.height;
      const totalVisible = decisionsToDisplay.length;

      decisionsToDisplay.forEach((decision, index) => {
        const paperNumber = totalVisible - index;
        const paperData = generatePaperData(paperNumber);

        ctx.fillStyle = decision.Label === 1 ? "#FFD700" : "#808080";
        ctx.beginPath();

        const lineWidth = Math.max(2, fullWidth / (totalVisible * 2)); // Adjust line width
        const x = fullWidth - ((index + 1) / totalVisible) * fullWidth;
        const lineHeight = fullHeight * 0.7;

        // Draw rounded rectangle with border
        ctx.roundRect(
          x - lineWidth, // Adjust x to account for line width
          (fullHeight - lineHeight) / 2, // Center the line vertically
          lineWidth,
          lineHeight,
          5 
        );
        ctx.strokeStyle = "#333"; // Border color
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fill();

        // Add a tooltip hover effect using canvas, store positions for reference
        decision.x = x;
        decision.paperData = paperData;
      });
    }
  }, [decisionsToDisplay, sliderValue]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleCanvasMouseMove = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const tooltipData = decisionsToDisplay.find(
      (decision) =>
        x >= decision.x - 10 &&
        x <= decision.x &&
        y >= (rect.height - 140) / 2 &&
        y <= (rect.height + 140) / 2
    );

    if (tooltipData) {
      const tooltip = document.getElementById("custom-tooltip");
      tooltip.style.display = "block";
      tooltip.style.left = `${event.clientX + 10}px`;
      tooltip.style.top = `${event.clientY - 10}px`;
      tooltip.innerHTML = `
        <div style="color: ${tooltipData.Label === 1 ? "#FFD700" : "#808080"}">
          <strong>${tooltipData.paperData.title}</strong>
          <p>${tooltipData.paperData.abstract}</p>
        </div>`;
    } else {
      const tooltip = document.getElementById("custom-tooltip");
      tooltip.style.display = "none";
    }
  };

  return (
    <StyledCard elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight="bold">
            Advanced Labeling History
          </Typography>
          <StyledTooltip
            title={
              <React.Fragment>
                <Typography variant="body2">
                  This chart shows your labeling history. Gold lines represent positive labels, while gray lines represent negative labels. Use the slider to zoom in on specific ranges of data.
                </Typography>
              </React.Fragment>
            }
          >
            <IconButton size="small">
              <HelpOutlineIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </IconButton>
          </StyledTooltip>
        </Box>
        <CardErrorHandler
          queryKey={"fetchLabelingChronology"}
          error={null} 
          isError={false} 
        />
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Box mb={1} position="relative">
              <canvas
                ref={canvasRef}
                width={900}
                height={200}
                style={{ width: "100%", height: 100, backgroundColor: "#222222" }}
                onMouseMove={handleCanvasMouseMove}
              />
              <div
                id="custom-tooltip"
                style={{
                  position: "absolute",
                  display: "none",
                  pointerEvents: "none",
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  padding: "10px",
                  borderRadius: "5px",
                  color: "#fff",
                  zIndex: 10,
                }}
              ></div>
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
                Showing {decisionsToDisplay.length} of {reversedDecisions.length} labels
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default AlternativeHistoryBar;

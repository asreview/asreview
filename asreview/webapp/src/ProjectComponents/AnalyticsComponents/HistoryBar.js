import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Box,
  Skeleton,
  IconButton,
  Typography,
  FormControlLabel,
  Switch,
  useTheme,
  Button,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Styled component for the main card
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(3, 6, 3, 6),
  borderRadius: 16,
  width: "100%",
  maxWidth: 960,
  height: "100%",
  transition: "height 0.3s ease",
}));

// Styled component for the container that holds the history items
const HistoryContainer = styled(Stack)(({ theme, expanded }) => ({
  width: "100%",
  maxWidth: 960,
  flexDirection: "row",
  flexWrap: "wrap",
  overflow: "hidden",
  justifyContent: "flex-end",
  rowGap: expanded ? theme.spacing(0.5) : 0,
  transition: "all 0.3s ease",
  ...(expanded && { rowGap: theme.spacing(0.5) }),
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
      .sort((a, b) => b.Label - a.Label);
    sorted.push(...chunk);
  }
  return sorted;
};

// More realistic titles and corresponding generated abstracts
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

// Function to generate the history lines
const generateLines = (total, decisions, chronological, chunkSize) => {
  const lines = [];
  const sortedDecisions = chronological
    ? decisions
    : sortPerChunk(decisions, chunkSize);

  for (let i = 0; i < total; i++) {
    const paperNumber = chronological ? i + 1 : total - i;
    const paperData = generatePaperData(paperNumber);

    const color =
      i < sortedDecisions.length
        ? sortedDecisions[i].Label === 1
          ? "#FFD700"
          : sortedDecisions[i].Label === 0
          ? "#808080"
          : "#D3D3D3"
        : "#D3D3D3";

    const textColor = color === "#FFD700" ? "#000000" : "#FFFFFF";

    lines.push(
      <Tooltip
        key={i}
        title={
          <Box
            p={1}
            maxWidth={200}
            bgcolor={color}
            borderRadius={3}
            boxShadow={3}
            sx={{
              color: textColor,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {paperData.title}
            </Typography>
            <Typography variant="body2" mt={1}>
              {paperData.abstract}
            </Typography>
          </Box>
        }
        arrow
        PopperProps={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -10],
              },
            },
          ],
          sx: {
            '.MuiTooltip-tooltip': {
              bgcolor: 'transparent',
              boxShadow: 'none',
            },
          },
        }}
      >
        <HistoryItem color={color} />
      </Tooltip>
    );
  }
  return lines;
};

const HistoryBar = ({ mobileScreen }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [chronological, setChronological] = useState(true);
  const [chunkSize, setChunkSize] = useState(30);
  const [mockData, setMockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const theme = useTheme();

  const handleExpandClick = () => {
    setExpanded(!expanded);
    setShowAll(false);
  };

  const handleSwitchChange = () => {
    setChronological(!chronological);
  };

  const handleToggleShowAll = () => {
    setShowAll(!showAll);
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

  // Generate mock data
  useEffect(() => {
    const generateMockData = (total_count = 50000, relevant_count = 13000) => {
      const data = [];
      let current_relevant = 0;
      
      // Define a sigmoid function for a smooth transition
      const sigmoid = (x) => 1 / (1 + Math.exp(-x));
      
      for (let i = 0; i < total_count; i++) {
        // Calculate probability of being relevant
        // This will start high and decrease over time
        const x = 10 * (i / total_count) - 5; // Scale to range -5 to 5
        const prob_relevant = 0.4 * (1 - sigmoid(x)) + 0.01; // Scale to range 0.01 to ~0.41
        
        if (Math.random() < prob_relevant && current_relevant < relevant_count) {
          data.push({ Label: 1 });
          current_relevant++;
        } else {
          data.push({ Label: 0 });
        }
      }

      return data;
    };

    setMockData(generateMockData());
    setIsLoading(false);
  }, []);

  const totalPapers = mockData.length;
  const itemsPerRow = chunkSize;
  const maxVisibleRows = 30;
  const maxVisibleItems = expanded
    ? showAll
      ? totalPapers
      : itemsPerRow * maxVisibleRows
    : 30;
  const visibleItems = Math.min(maxVisibleItems, totalPapers);
  const recordsLeft = Math.max(0, totalPapers - visibleItems);
  const latestDecisions = mockData.slice(-totalPapers);

  // Adjusting the latest decisions when expanded
  const decisionsToDisplay = expanded
    ? latestDecisions.slice(-visibleItems)
    : latestDecisions.slice(-visibleItems);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 960 }}>
      <StyledCard elevation={2}>
        <CardContent style={{ padding: 0 }}>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Stack spacing={1} alignItems="center" width="100%">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Box display="flex" alignItems="center">
                    <Typography
                      variant="h6"
                      fontSize={!mobileScreen ? "1.25rem" : "1rem"}
                    >
                      Labeling History
                    </Typography>
                    <IconButton onClick={handleExpandClick}>
                      {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={chronological}
                          onChange={handleSwitchChange}
                          name="chronological"
                          color="primary"
                        />
                      }
                      label="Chronological"
                      labelPlacement="start"
                    />
                  </Box>
                </Box>
                {isLoading ? (
                  <Box width="100%">
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      justifyContent="flex-end"
                    >
                      {Array.from(new Array(30)).map((_, index) => (
                        <Skeleton
                          key={index}
                          variant="rectangular"
                          width={theme.spacing(3.15)}
                          height={theme.spacing(0.625)}
                          style={{ margin: theme.spacing(0.125) }}
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <>
                    <HistoryContainer
                      expanded={expanded ? 1 : 0}
                      ref={containerRef}
                    >
                      {generateLines(
                        visibleItems,
                        decisionsToDisplay,
                        chronological,
                        chunkSize
                      )}
                    </HistoryContainer>
                    {expanded && (
                      <Button
                        onClick={handleToggleShowAll}
                        sx={{
                          fontWeight: "bold",
                          width: "100%",
                          mt: 1,
                        }}
                      >
                        {showAll
                          ? "Collapse"
                          : `${recordsLeft} ${
                              recordsLeft === 1 ? "record" : "more"
                            } records`}
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>
    </div>
  );
};

export default HistoryBar;

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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { CardErrorHandler } from "Components";

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

/*
Function to sort decisions within chunks
1. Initialize an empty array called 'sorted' to hold the sorted chunks.
2. Iterate over the 'decisions' array in steps of 'chunkSize' to process the array in smaller segments (chunks) of the specified size.
3. For each iteration, create a chunk of the 'decisions' array using 'slice' and sort it in descending order based on the 'Label' property.
4. Spread and push the sorted chunk into the 'sorted' array.
5. Return the 'sorted' array, which now contains all the decisions sorted in chunks.
*/

// Function to generate the history lines
const generateLines = (total, decisions, chronological, chunkSize) => {
  const lines = [];
  const sortedDecisions = chronological
    ? decisions
    : sortPerChunk(decisions, chunkSize);

  for (let i = 0; i < total; i++) {
    if (i < sortedDecisions.length) {
      lines.push(
        <HistoryItem
          key={i}
          color={
            sortedDecisions[i].Label === 1
              ? "#FFD700"
              : sortedDecisions[i].Label === 0
                ? "#808080"
                : "#D3D3D3"
          }
        />,
      );
    } else {
      lines.push(<HistoryItem key={i} color="#D3D3D3" />);
    }
  }
  return lines;
};

/*
Function to generate the history lines
1. Initialize an empty array called 'lines' to hold the 'HistoryItem' components.
2. Decide how to sort the 'decisions' array based on the 'chronological' parameter:
   - If 'chronological' is true, use the 'decisions' array as is.
   - If 'chronological' is false, call the 'sortPerChunk' function to sort the decisions in chunks.
3. Iterate 'total' times to generate the 'HistoryItem' components:
   - For each iteration, check if there is a corresponding decision in the 'sortedDecisions' array.
   - If there is a decision, create a 'HistoryItem' component with a color based on the 'Label' property:
     - 'Label' of 1 results in a gold color ('#FFD700').
     - 'Label' of 0 results in a gray color ('#808080').
     - Any other 'Label' results in a light gray color ('#D3D3D3').
   - If there is no corresponding decision (i.e., 'i' exceeds the length of 'sortedDecisions'), create a 'HistoryItem' with a default light gray color ('#D3D3D3').
4. Return the 'lines' array containing the 'HistoryItem' components.
*/

const HistoryBar = ({
  labelingChronologyQuery,
  progressQuery,
  mobileScreen,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [chronological, setChronological] = useState(true);
  const [chunkSize, setChunkSize] = useState(30);
  const containerRef = useRef(null);
  const theme = useTheme();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleSwitchChange = () => {
    setChronological(!chronological);
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
  const progressDensity = labelingChronologyQuery?.data || [];
  const visibleCount = expanded ? totalPapers : 30;
  const latestDecisions = progressDensity.slice(-visibleCount);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 960 }}>
      <CardErrorHandler
        queryKey={"fetchLabelingChronology"}
        error={labelingChronologyQuery?.error}
        isError={labelingChronologyQuery?.isError}
      />
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
                {labelingChronologyQuery?.isLoading ? (
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
                  <HistoryContainer
                    expanded={expanded ? 1 : 0}
                    ref={containerRef}
                  >
                    {generateLines(
                      visibleCount,
                      latestDecisions,
                      chronological,
                      chunkSize,
                    )}
                  </HistoryContainer>
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

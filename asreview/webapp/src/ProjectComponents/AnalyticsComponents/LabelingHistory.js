import {
  Box,
  Card,
  CardContent,
  Grid2 as Grid,
  IconButton,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { useRef, useState } from "react";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";

const sortPerChunk = (decisions, chunkSize) => {
  const sorted = [];
  for (let i = 0; i < decisions.length; i += chunkSize) {
    sorted.push(
      ...decisions.slice(i, i + chunkSize).sort((a, b) => b.label - a.label),
    );
  }
  return sorted;
};

const LabelingHistory = ({ genericDataQuery, progressQuery }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState("chronological");
  const [infoAnchorEl, setInfoAnchorEl] = useState(null);
  const containerRef = useRef(null);

  const totalPapers = progressQuery?.data?.n_records || 0;
  const labelingChronology = genericDataQuery?.data || [];
  const maxItemsToDisplay = 270;
  const [itemsToDisplay, setItemsToDisplay] = useState(maxItemsToDisplay);

  const mdScreen = useMediaQuery(theme.breakpoints.down("md"));
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));

  let chunkSize = 30;
  if (smScreen) {
    chunkSize = 10;
  } else if (mdScreen) {
    chunkSize = 15;
  }

  const processDisplayedData = () => {
    const endIndex = labelingChronology.length;
    const startIndex = Math.max(0, endIndex - itemsToDisplay);
    const displayedDecisions = labelingChronology.slice(startIndex, endIndex);
    const unlabeledCount = Math.max(
      0,
      itemsToDisplay - displayedDecisions.length,
    );
    const unlabeledRecords = Array(unlabeledCount).fill({ label: null });
    const combinedData = [...displayedDecisions, ...unlabeledRecords];

    return viewMode === "chronological"
      ? combinedData
      : sortPerChunk(combinedData, chunkSize);
  };

  const labels = processDisplayedData();

  const infoOpen = Boolean(infoAnchorEl);
  const infoId = infoOpen ? "info-popover" : undefined;

  const handleLoadMore = () => {
    setItemsToDisplay(
      Math.min(itemsToDisplay + maxItemsToDisplay, totalPapers),
    );
  };

  return (
    <Box position="relative" width="100%" maxWidth={960}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={genericDataQuery?.error}
        isError={!!genericDataQuery?.isError}
      />
      <Card sx={{ backgroundColor: "transparent", mt: 2 }}>
        <CardContent>
          <Stack>
            <Box sx={{ mb: 1, display: "flex", gap: 1 }}>
              <Chip
                label="Chronological"
                onClick={() => setViewMode("chronological")}
                variant={viewMode === "chronological" ? "filled" : "outlined"}
                color="primary"
                sx={{
                  "&.MuiChip-filled": {
                    backgroundColor: "primary.light",
                  },
                }}
              />
              <Chip
                label="Grouped"
                onClick={() => setViewMode("grouped")}
                variant={viewMode === "grouped" ? "filled" : "outlined"}
                color="primary"
                sx={{
                  "&.MuiChip-filled": {
                    backgroundColor: "primary.light",
                  },
                }}
              />
            </Box>
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
              <IconButton
                size="small"
                onClick={(event) => {
                  setInfoAnchorEl(event.currentTarget);
                }}
              >
                <LightbulbOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box
              ref={containerRef}
              sx={{
                width: 1,
                mt: 2,
              }}
            >
              {/* Rendering the labeling history grid */}
              <Grid
                container
                columnSpacing={"5px"}
                rowSpacing={1}
                columns={30}
                sx={{
                  width: 1,
                }}
              >
                {labels.map((decision, index) => (
                  <Grid
                    key={index}
                    size={{ xs: 3, sm: 2, md: 1 }}
                    sx={{
                      height: "10px",
                      bgcolor:
                        decision.label === 1
                          ? "grey.600"
                          : decision.label === 0
                            ? "primary.light"
                            : "grey.400", // Unlabeled records
                      borderRadius: 3,
                    }}
                  />
                ))}
              </Grid>

              {itemsToDisplay < totalPapers && (
                <Box display="flex" justifyContent="center" sx={{ mt: 1 }}>
                  <Button onClick={handleLoadMore}>Show More ↓</Button>
                </Box>
              )}

              {itemsToDisplay >= totalPapers && (
                <Typography align="center" sx={{ mt: 1 }}>
                  All records are displayed.
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Popover
        id={infoId}
        open={infoOpen}
        anchorEl={infoAnchorEl}
        onClose={() => {
          setInfoAnchorEl(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Labeling History
              </Typography>
              <Typography variant="body2">
                These are all the records in your dataset, starting from the
                labeled ones. Each colored item represents a record. The most
                recent decisions are displayed on the bottom right side.
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "primary.light" }}
              >
                Arrow of time: → ↓
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Chronological View
                  </Typography>
                  <Typography variant="body2">
                    Records appear chronologically, showing your labeling
                    journey in the correct order.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Grouped View
                  </Typography>
                  <Typography variant="body2">
                    Records are grouped by type, showing the patterns in your
                    decisions.
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Color Guide
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 8,
                      bgcolor: "grey.600",
                      borderRadius: 3,
                    }}
                  />
                  <Typography variant="body2">Relevant</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 8,
                      bgcolor: "primary.light",
                      borderRadius: 3,
                    }}
                  />
                  <Typography variant="body2">Not Relevant</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 8,
                      bgcolor: "grey.400",
                      borderRadius: 3,
                    }}
                  />
                  <Typography variant="body2">Unlabeled</Typography>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Button
                href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", p: 0 }}
              >
                Learn more →
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

export default LabelingHistory;

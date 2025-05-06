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
  Chip,
  Button,
  Divider,
  Skeleton,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { useRef, useState } from "react";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

const sortPerChunk = (decisions, chunkSize) => {
  const sorted = [];
  for (let i = 0; i < decisions.length; i += chunkSize) {
    sorted.push(
      ...decisions.slice(i, i + chunkSize).sort((a, b) => b.label - a.label),
    );
  }
  return sorted;
};

const LoadingSkeleton = ({ chunkSize = 30 }) => {
  const defaultItemsToShow = 420;

  return (
    <Box width="100%" maxWidth={960}>
      <Card sx={{ backgroundColor: "transparent", mt: 2 }}>
        <CardContent>
          <Stack>
            <Box sx={{ mb: 1, display: "flex", gap: 1 }}>
              <Skeleton width={100} height={32} sx={{ borderRadius: 8 }} />
              <Skeleton width={80} height={32} sx={{ borderRadius: 8 }} />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Grid
                container
                columnSpacing={"5px"}
                rowSpacing={1}
                columns={30}
                sx={{ width: 1 }}
              >
                {Array(defaultItemsToShow)
                  .fill(0)
                  .map((_, index) => (
                    <Grid key={index} size={{ xs: 3, sm: 2, md: 1 }}>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          height: "8px",
                          borderRadius: 3,
                        }}
                      />
                    </Grid>
                  ))}
              </Grid>
              <Stack
                direction="row"
                spacing={3}
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                <Skeleton width={160} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton width={200} height={36} sx={{ borderRadius: 1 }} />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const LabelingHistory = ({ genericDataQuery, progressQuery }) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState("chronological");
  const [infoAnchorEl, setInfoAnchorEl] = useState(null);
  const mdScreen = useMediaQuery(theme.breakpoints.down("md"));
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [itemsToDisplay, setItemsToDisplay] = useState(
    smScreen || mdScreen ? 300 : 540,
  );

  let chunkSize = 30;
  if (smScreen) {
    chunkSize = 10;
  } else if (mdScreen) {
    chunkSize = 15;
  }

  if (genericDataQuery.isLoading || progressQuery.isLoading) {
    return <LoadingSkeleton chunkSize={chunkSize} />;
  }

  const totalPapers = progressQuery?.data?.n_records_no_priors || 0;
  const labelingChronology = genericDataQuery?.data || [];
  const maxItemsToDisplay = 300;

  const allRecords = Array(Math.min(itemsToDisplay, totalPapers))
    .fill({ label: null })
    .map((record, index) => {
      return labelingChronology[index] || record;
    });

  const labels =
    viewMode === "chronological"
      ? allRecords
      : sortPerChunk(allRecords, chunkSize);

  const infoOpen = Boolean(infoAnchorEl);
  const infoId = infoOpen ? "info-popover" : undefined;

  const handleShowMore = () => {
    setItemsToDisplay((prev) =>
      Math.min(prev + maxItemsToDisplay, totalPapers),
    );
  };

  const handleExpandToLastLabeled = () => {
    const lastLabeledIndex = labelingChronology.findLastIndex(
      (record) => record.label === 1 || record.label === 0,
    );
    if (lastLabeledIndex !== -1) {
      setItemsToDisplay(lastLabeledIndex + 1);
    }
  };

  const remainingRecords = totalPapers - itemsToDisplay;

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
              />
              <Chip
                label="Grouped"
                onClick={() => setViewMode("grouped")}
                variant={viewMode === "grouped" ? "filled" : "outlined"}
                color="primary"
              />
            </Box>
            <Box sx={{ position: "absolute", top: 11, right: 8 }}>
              <IconButton
                size="small"
                onClick={(event) => {
                  setInfoAnchorEl(event.currentTarget);
                }}
              >
                <StyledLightBulb fontSize="small" />
              </IconButton>
            </Box>

            <Box
              ref={containerRef}
              sx={{
                width: 1,
                mt: 2,
              }}
            >
              <Grid
                container
                columnSpacing={"5px"}
                rowSpacing={1}
                columns={30}
                sx={{ width: 1 }}
              >
                {labels.map((decision, index) => (
                  <Grid
                    key={index}
                    size={{ xs: 3, sm: 2, md: 1 }}
                    sx={{
                      height: "8px",
                      bgcolor:
                        decision.label === 1
                          ? "tertiary.dark"
                          : decision.label === 0
                            ? "grey.600"
                            : "grey.400",
                      borderRadius: 3,
                    }}
                  />
                ))}
              </Grid>
              {remainingRecords > 0 && (
                <Stack
                  direction="row"
                  spacing={3}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button
                    onClick={handleShowMore}
                    startIcon={<ExpandMoreIcon />}
                    color="primary"
                    sx={{ textTransform: "none" }}
                  >
                    Load {Math.min(maxItemsToDisplay, remainingRecords)} more
                  </Button>
                  <Button
                    onClick={handleExpandToLastLabeled}
                    startIcon={<KeyboardDoubleArrowRightIcon />}
                    color="primary"
                    sx={{ textTransform: "none" }}
                  >
                    Expand until last labeled record
                  </Button>
                </Stack>
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
              <Typography variant="body2" align="justify">
                This is your entire dataset. Each element represents a record,
                colored according to whether you marked it as relevant, not
                relevant, or haven't reviewed it yet. This visualization helps
                you understand how your screening has progressed and where you
                are in the review process.
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "grey.600" }}
              ></Typography>
            </Box>
            <Box>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 8,
                      bgcolor: "tertiary.dark",
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
                      bgcolor: "grey.600",
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
            <Divider />
            <Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Chronological
                  </Typography>
                  <Typography variant="body2" align="justify">
                    Records appear chronologically, showing your labeling
                    journey in the correct order.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Grouped
                  </Typography>
                  <Typography variant="body2" align="justify">
                    Records are grouped by type, showing the patterns in your
                    decisions.
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box>
              <Button
                href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

export default LabelingHistory;

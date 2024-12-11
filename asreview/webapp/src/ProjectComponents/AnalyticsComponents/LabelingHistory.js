import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  Popover,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { useToggle } from "hooks/useToggle";
import { useRef, useState, useMemo } from "react";

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
  const [chronological, toggleChronological] = useToggle(true);
  // const [anchorEl, setAnchorEl] = useState(null);
  const [infoAnchorEl, setInfoAnchorEl] = useState(null);
  // const [selectedPaper, setSelectedPaper] = useState(null);
  const containerRef = useRef(null);

  // const handleClick = (event, index, color) => {
  //   setAnchorEl(event.currentTarget);
  //   setSelectedPaper(index);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  //   setSelectedPaper(null);
  // };

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

  // Limit data processing to displayed items
  const decisionsToDisplay = useMemo(() => {
    const displayedDecisions = labelingChronology.slice(0, itemsToDisplay);
    const unlabeledCount = Math.max(0, itemsToDisplay - displayedDecisions.length);
    const unlabeledRecords = Array.from({ length: unlabeledCount }, () => ({
      label: null,
    }));
    return [...displayedDecisions, ...unlabeledRecords];
  }, [labelingChronology, itemsToDisplay]);

  const labels = useMemo(() => {
    return chronological
      ? decisionsToDisplay
      : sortPerChunk(decisionsToDisplay, chunkSize);
  }, [decisionsToDisplay, chronological, chunkSize]);

  // const open = Boolean(anchorEl);
  // const id = open ? "paper-popover" : undefined;

  const infoOpen = Boolean(infoAnchorEl);
  const infoId = infoOpen ? "info-popover" : undefined;

  return (
    <Box position="relative" width="100%" maxWidth={960}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={genericDataQuery?.error}
        isError={!!genericDataQuery?.isError}
      />
      <Card sx={{ backgroundColor: 'transparent'}}>
        <CardContent>
          <Stack>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={chronological}
                    onChange={toggleChronological}
                  />
                }
                label={<Typography variant="body2">Chronological</Typography>}
                labelPlacement="end"
              />
            </Box>

            <Box>
              <IconButton
                size="small"
                onClick={(event) => {
                  setInfoAnchorEl(event.currentTarget);
                }}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box
              ref={containerRef}
              sx={{
                width: 1,
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
                      height: 
                      decision.label === 1
                          ? "10px"
                          : decision.label === 0
                          ? "8px"
                          : "8px",
                      bgcolor:
                        decision.label === 1
                          ? "grey.600"
                          : decision.label === 0
                          ? "primary.light"
                          : "grey.400", // Unlabeled records
                        borderRadius: 
                        decision.label === 1
                          ? 4
                          : decision.label === 0
                          ? 1
                          : 1,
                        }}
                      />
                    ))}
                    </Grid>

                    {itemsToDisplay < totalPapers && (
                    <Box display="flex" justifyContent="center" sx={{ mt: 1 }}>
                      <Button
                      onClick={() =>
                        setItemsToDisplay(
                        Math.min(itemsToDisplay + maxItemsToDisplay, totalPapers),
                        )
                      }
                      >
                      Show More
                      </Button>
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
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
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
            relevant records, gray lines represent irrelevant records, and light
            gray lines represent unlabeled records. When you click on a line, you
            can view that paper's details.
          </Typography>
          <Box>
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

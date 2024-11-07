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
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { useToggle } from "hooks/useToggle";
import { useRef, useState } from "react";

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
  const maxVisibleItems = totalPapers;
  const visibleItems = Math.min(maxVisibleItems, totalPapers);
  const decisionsToDisplay = labelingChronology
    .slice(-totalPapers)
    .slice(-visibleItems);

  // const open = Boolean(anchorEl);
  // const id = open ? "paper-popover" : undefined;

  const infoOpen = Boolean(infoAnchorEl);
  const infoId = infoOpen ? "info-popover" : undefined;

  const maxItemsToDisplay = 390;

  const mdScreen = useMediaQuery(theme.breakpoints.down("md"));
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));

  let chunkSize = 30;
  if (smScreen) {
    chunkSize = 10;
  } else if (mdScreen) {
    chunkSize = 15;
  }

  const labels = chronological
    ? decisionsToDisplay
    : sortPerChunk(decisionsToDisplay, chunkSize);

  return (
    <Box position="relative" width="100%" maxWidth={960}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={genericDataQuery?.error}
        isError={!!genericDataQuery?.isError}
      />
      <Card>
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
              {/* {generateLines(
                  visibleItems,
                  decisionsToDisplay,
                  !chronological,
                  chunkSize,
                  handleClick,
                  theme,
                )} */}

              <Grid
                container
                columnSpacing={"3px"}
                rowSpacing={1}
                columns={30}
                sx={{
                  width: 1,
                }}
              >
                {labels.map((decision, index) => (
                  <Grid
                    size={{ xs: 3, sm: 2, md: 1 }}
                    key={index}
                    sx={{
                      height: "5px",
                      bgcolor:
                        decision.label === 1
                          ? "secondary.main"
                          : "primary.light",
                      borderRadius: 1,
                    }}
                  />
                ))}

                {Array.from(
                  { length: maxItemsToDisplay - labels.length },
                  (value, index) => (
                    <Grid
                      size={{ xs: 3, sm: 2, md: 1 }}
                      key={`unseen-or-irrelevant-${index}`}
                      sx={{
                        height: "5px",
                        bgcolor: "grey.400",
                        borderRadius: 1,
                      }}
                    />
                  ),
                )}
              </Grid>

              {maxItemsToDisplay < progressQuery?.data?.n_records && (
                <Typography align="center" sx={{ mt: 1 }}>
                  {progressQuery?.data?.n_records - maxItemsToDisplay} more
                  records
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
      {/* <Popover id={id} open={open} anchorEl={anchorEl} onClose={handleClose}>
        {selectedPaper !== null && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Placeholder Title
            </Typography>
            <Typography variant="caption">Coming Soon</Typography>
            <Typography variant="body2">Placeholder Abstract</Typography>
          </Box>
        )}
      </Popover> */}
      <Popover
        id={infoId}
        open={infoOpen}
        anchorEl={infoAnchorEl}
        onClose={() => {
          setInfoAnchorEl(null);
        }}
      >
        <Box>
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
            relevant records, while gray lines represent irrelevant records.
            When you click on a line, you can view that paper's details.
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

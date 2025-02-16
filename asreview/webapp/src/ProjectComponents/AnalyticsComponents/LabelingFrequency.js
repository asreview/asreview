import React from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Menu,
  Typography,
  Stack,
  Skeleton,
  useMediaQuery,
  Popover,
  Divider,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GetAppIcon from "@mui/icons-material/GetApp";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { CardErrorHandler } from "Components";
import { ScatterChart, legendClasses } from "@mui/x-charts";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { useQuery } from "react-query";
import { ProjectAPI } from "api";

const calculateGapData = (decisions) => {
  if (!Array.isArray(decisions)) return { gapData: [], relevantPoints: [] };

  const gapData = [];
  const relevantPoints = [];
  let currentGap = 0;

  for (let index = 0; index < decisions.length; index++) {
    const record = decisions[index];
    if (record?.label === 1) {
      relevantPoints.push({ x: index, y: 0 });
      currentGap = 0;
    } else {
      gapData.push({ x: index, y: currentGap });
      currentGap++;
    }
  }

  return { gapData, relevantPoints };
};

const createStoppingThresholdLine = (totalRecords, threshold) => {
  return [
    { x: 0, y: threshold },
    { x: totalRecords, y: threshold },
  ];
};

export default function RelevanceGapsChart({ project_id }) {
  const theme = useTheme();
  const mobileScreen = useMediaQuery(theme.breakpoints.down("md"));
  const chartRef = React.useRef(null);
  const [anchorElMenu, setAnchorElMenu] = React.useState(null);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [anchorPosition, setAnchorPosition] = React.useState({
    top: 0,
    left: 0,
  });

  const progressQuery = useQuery(
    ["fetchProgress", { project_id }],
    ProjectAPI.fetchProgress,
    { refetchOnWindowFocus: false },
  );

  const genericDataQuery = useQuery(
    ["fetchGenericData", { project_id }],
    ProjectAPI.fetchGenericData,
    { refetchOnWindowFocus: false },
  );

  const stoppingQuery = useQuery(
    ["fetchStopping", { project_id }],
    ProjectAPI.fetchStopping,
    { refetchOnWindowFocus: false },
  );

  const handleDownloadClick = (event) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleDownload = (format) => {
    setAnchorElMenu(null);
    const node = chartRef.current;
    const downloadFileName = `relevance_gaps.${format}`;

    switch (format) {
      case "png":
        toPng(node).then((dataUrl) => {
          const link = document.createElement("a");
          link.download = downloadFileName;
          link.href = dataUrl;
          link.click();
        });
        break;
      case "jpeg":
        toJpeg(node, {
          quality: 1,
          bgcolor: theme.palette.background.paper,
        }).then((dataUrl) => {
          const link = document.createElement("a");
          link.download = downloadFileName;
          link.href = dataUrl;
          link.click();
        });
        break;
      case "svg":
        toSvg(node).then((dataUrl) => {
          const link = document.createElement("a");
          link.download = downloadFileName;
          link.href = dataUrl;
          link.click();
        });
        break;
      default:
        break;
    }
  };

  const handlePopoverOpen = (event) => {
    setAnchorPosition({
      top: event.clientY + 10,
      left: event.clientX - 50,
    });
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
  };

  if (
    genericDataQuery.isLoading ||
    progressQuery.isLoading ||
    !genericDataQuery.data
  ) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </Card>
    );
  }

  const { gapData, relevantPoints } = calculateGapData(
    genericDataQuery.data || [],
  );

  if (gapData.length === 0 && relevantPoints.length === 0) {
    return (
      <Card>
        <CardContent>
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            height={400}
          >
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const beginningScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <path
        d="M5,50 L95,50"
        stroke={theme.palette.grey[600]}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M5,50 L20,35 M20,50 L35,35 M35,50 L50,35"
        stroke={theme.palette.primary.main}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  const endScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <path
        d="M5,50 L35,50"
        stroke={theme.palette.grey[600]}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M35,50 L95,10"
        stroke={theme.palette.primary.main}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  return (
    <Card sx={{ bgcolor: "transparent" }}>
      <CardErrorHandler
        queryKey="fetchGenericData and fetchProgress"
        error={genericDataQuery?.error || progressQuery?.error}
        isError={!!genericDataQuery?.isError || !!progressQuery?.isError}
      />
      <CardContent>
        <Stack>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={handleDownloadClick}>
              <GetAppIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorElMenu}
              open={Boolean(anchorElMenu)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleDownload("png")}>
                Download as PNG
              </MenuItem>
              <MenuItem onClick={() => handleDownload("jpeg")}>
                Download as JPEG
              </MenuItem>
              <MenuItem onClick={() => handleDownload("svg")}>
                Download as SVG
              </MenuItem>
            </Menu>
            <IconButton
              size="small"
              onClick={handlePopoverOpen}
              aria-owns={popoverOpen ? "info-popover" : undefined}
              aria-haspopup="true"
            >
              <StyledLightBulb fontSize="small" />
            </IconButton>
          </Box>

          <Box ref={chartRef}>
            <ScatterChart
              height={400}
              series={[
                {
                  data: relevantPoints,
                  label: "Relevant Records",
                  valueFormatter: (value) => `Record ${value.x + 1}`,
                  color: theme.palette.grey[600],
                },
                {
                  data: gapData,
                  label: "Not Relevant Records",
                  valueFormatter: (value) => `Record ${value.x + 1}`,
                  color: theme.palette.primary.main,
                },
                ...(stoppingQuery.data?.params?.n
                  ? [
                      {
                        data: createStoppingThresholdLine(
                          genericDataQuery.data?.length - 1 || 0,
                          stoppingQuery.data.params.n,
                        ),
                        label: "Stopping Threshold",
                        color: theme.palette.grey[500],
                        showMark: false,
                      },
                    ]
                  : []),
              ]}
              xAxis={[
                {
                  label: "Records Reviewed",
                },
              ]}
              yAxis={[
                {
                  label: "Records Since Last Relevant",
                  min: 0,
                },
              ]}
              slotProps={{
                legend: {
                  direction: mobileScreen ? "column" : "row",
                  position: { vertical: "top", horizontal: "left" },
                  padding: { top: -10 },
                  itemMarkWidth: 14,
                  itemMarkHeight: 14,
                  markGap: 5,
                  itemGap: 10,
                  labelStyle: {
                    fontSize: 12,
                    fill: theme.palette.text.secondary,
                  },
                },
              }}
              sx={{
                [`.${legendClasses.mark}`]: {
                  rx: 10,
                },
                ".MuiChartsLegend-root": {
                  transform: "translate(24px, 8px)",
                },
              }}
            />
          </Box>

          <Popover
            open={popoverOpen}
            onClose={handlePopoverClose}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
            PaperProps={{
              sx: {
                borderRadius: 3,
                maxWidth: 320,
              },
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    Relevance Gaps
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "justify" }}>
                    This chart shows the distance between relevant records as
                    you review. Each point represents how many non-relevant
                    records you've seen since the last relevant one. The dots on
                    the top mark your stopping threshold.
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    Comparing Examples
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, textAlign: "justify" }}
                      >
                        <strong>Near the beginning:</strong> {""} Small gaps
                        between relevant records with occasional short rises,
                        indicating frequent discovery of relevant items.
                      </Typography>
                      {beginningScenarioSVG}
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, textAlign: "justify" }}
                      >
                        <strong>Near the end:</strong> {""} After finding the
                        last relevant records, the gap keeps increasing as more
                        non-relevant records are reviewed, suggesting you might
                        be reaching the end.
                      </Typography>
                      {endScenarioSVG}
                    </Box>
                  </Stack>
                </Box>
                <Button
                  href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: "none", p: 0 }}
                >
                  Learn more →
                </Button>
              </Stack>
            </Box>
          </Popover>
        </Stack>
      </CardContent>
    </Card>
  );
}

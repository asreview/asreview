import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  Popover,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { HelpOutline } from "@mui/icons-material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { toPng, toJpeg, toSvg } from "html-to-image";
import Chart from "react-apexcharts";

import { CardErrorHandler } from "Components";

import tooltipIrrelevantDark from "images/progress_irrelevant_dark.png";
import tooltipIrrelevantLight from "images/progress_irrelevant_light.png";
import tooltipRelevantDark from "images/progress_relevant_dark.png";
import tooltipRelevantLight from "images/progress_relevant_light.png";

const calculateProgressDensity = (data) => {
  return data.map((entry, index, arr) => {
    // Create a rolling window of up to 10 entries
    const window = arr.slice(Math.max(0, index - 9), index + 1);

    // Calculate the mean of the 'label' over the window
    const mean =
      window.reduce((acc, curr) => acc + curr.label, 0) / window.length;

    // Calculate the relevant counts
    let relevant;
    if (index + 1 < 10) {
      // For the first 9 items, scale to the number of items in the window
      relevant = mean * (index + 1);
    } else {
      // After 10 items, scale to 10
      relevant = mean * 10;
    }

    // Round to 1 decimal place to match the backend behavior
    return {
      x: index + 1,
      y: Math.round(relevant * 10) / 10,
    };
  });
};

const returnTooltipRelevantImg = (theme) => {
  return theme.palette.mode === "light"
    ? tooltipRelevantLight
    : tooltipRelevantDark;
};

const returnTooltipIrrelevantImg = (theme) => {
  return theme.palette.mode === "light"
    ? tooltipIrrelevantLight
    : tooltipIrrelevantDark;
};

export default function ProgressDensityChart(props) {
  const theme = useTheme();
  const chartRef = useRef(null);

  const [anchorElPopover, setAnchorElPopover] = useState(null);
  const [anchorElMenu, setAnchorElMenu] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorElPopover(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorElPopover(null);
  };

  const popoverOpen = Boolean(anchorElPopover);

  const handleDownloadClick = (event) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleDownload = (format) => {
    setAnchorElMenu(null);

    const node = chartRef.current.querySelector(".apexcharts-canvas");
    const downloadFileName = `chart.${format}`;

    switch (format) {
      case "png":
        toPng(node)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = downloadFileName;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("oops, something went wrong!", error);
          });
        break;
      case "jpeg":
        toJpeg(node, {
          quality: 1,
          bgcolor: theme.palette.background.paper,
        })
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = downloadFileName;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("oops, something went wrong!", error);
          });
        break;
      case "svg":
        toSvg(node)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = downloadFileName;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("oops, something went wrong!", error);
          });
        break;
      default:
        break;
    }
  };

  const seriesArray = useCallback(() => {
    if (props.genericDataQuery.data) {
      return [
        {
          name: "Relevant records",
          data: calculateProgressDensity(props.genericDataQuery.data),
        },
      ];
    } else {
      return [];
    }
  }, [props.genericDataQuery.data]);

  const optionsChart = useCallback(() => {
    return {
      chart: {
        animations: {
          enabled: false,
        },
        background: "transparent",
        id: "ASReviewLABprogressDensity",
        type: "area",
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: [
        theme.palette.mode === "light"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
        theme.palette.grey[600],
      ],
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: theme.palette.mode === "light" ? 0.9 : 0.2,
          opacityFrom: 0.5,
          opacityTo: 0.9,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        fontSize: "14px",
        fontFamily: theme.typography.subtitle2.fontFamily,
        fontWeight: theme.typography.subtitle2.fontWeight,
        labels: {
          colors: theme.palette.text.secondary,
        },
        markers: {
          width: 8,
          height: 8,
          offsetX: -4,
        },
        itemMargin: {
          horizontal: 16,
        },
      },
      markers: {
        size: 0,
      },
      noData: {
        text: "No data available",
      },
      stroke: {
        curve: "smooth",
        lineCap: "round",
        width: 2,
      },
      theme: {
        mode: theme.palette.mode,
      },
      tooltip: {},
      xaxis: {
        decimalsInFloat: 0,
        title: {
          text: "Records Reviewed",
        },
        type: "numeric",
        labels: {
          show: true,
        },
        axisTicks: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        showAlways: false,
        max: 10,
        min: 0,
        tickAmount: 5,
        title: {
          text: "Relevant Records",
        },
      },
    };
  }, [theme]);

  const [series, setSeries] = useState(seriesArray());
  const [options, setOptions] = useState(optionsChart());

  useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <Card>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={props.genericDataQuery?.error}
        isError={!!props.genericDataQuery?.isError}
      />
      <CardContent>
        <Stack>
          <Box>
            <IconButton onClick={handleDownloadClick}>
              <GetAppIcon />
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
              onClick={handlePopoverOpen}
              aria-owns={popoverOpen ? "info-popover" : undefined}
              aria-haspopup="true"
            >
              <HelpOutline fontSize={!props.mobileScreen ? "small" : "12px"} />
            </IconButton>
            <Popover
              id="info-popover"
              open={popoverOpen}
              anchorEl={anchorElPopover}
              onClose={handlePopoverClose}
            >
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Progress Density Chart</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  This chart visualizes the density of relevant records reviewed
                  over time. It helps track the efficiency of the review
                  process.
                </Typography>
                <Stack>
                  <Box>
                    <img
                      src={returnTooltipRelevantImg(theme)}
                      alt="tooltip relevant"
                      className="tooltip-img"
                      style={{ width: 24, height: 24 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        Presence of relevant records
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Relevant records still appear. Continue reviewing to
                        discover more.
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <img
                      src={returnTooltipIrrelevantImg(theme)}
                      alt="tooltip irrelevant"
                      className="tooltip-img"
                      style={{ width: 24, height: 24 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        Irrelevant records only
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Relevant records do not appear. Refer to your stopping
                        rule to decide if you want to continue reviewing.
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
                <Box>
                  <a
                    href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: "none",
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
          {props.genericDataQuery.isLoading ? (
            <Skeleton variant="rectangular" height={400} width="100%" />
          ) : (
            <div ref={chartRef}>
              <Chart
                options={options}
                series={series}
                type="area"
                height={400}
                width="100%"
              />
            </div>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

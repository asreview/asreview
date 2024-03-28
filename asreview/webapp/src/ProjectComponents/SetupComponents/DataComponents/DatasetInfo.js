import * as React from "react";
import { useQuery, useMutation } from "react-query";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CardErrorHandler } from "Components";
import { ProjectAPI } from "api";

import { styled, useTheme } from "@mui/material/styles";

import Chart from "react-apexcharts";

import { projectModes } from "globals.js";


const classes = {};

const Root = styled("div")(({ theme }) => ({}));


const DatasetInfo = ({ project_id, dataset_path, setDataset }, props) => {

  console.log("render state")
  const {
    data,
    error: fetchDataError,
    isError: isFetchDataError,
    isFetching: isFetchingData,
  } = useQuery(
    ["fetchData", { project_id: project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: deleteProject } = useMutation(
    ProjectAPI.mutateDeleteProject,
    {
      mutationKey: ["mutateDeleteProject"],
      onSuccess: () => {
        setDataset(null);
      },
    },
  );

  const theme = useTheme();
  const n_papers = data?.n_rows;
  const n_included = data?.n_relevant;
  const n_excluded = data?.n_irrelevant;
  const n_duplicates = data?.n_duplicates;
  const n_unique = n_papers - n_duplicates;
  const n_missing_title = data?.n_missing_title;
  const n_has_title = n_papers - n_missing_title;
  const n_missing_abstract = data?.n_missing_abstract;
  const n_has_abstract = n_papers - n_missing_abstract;
  const n_english = data?.n_english;

  const formattedTotal = React.useCallback(() => {
    if (props.mode !== projectModes.SIMULATION || !props.isSimulating) {
      return n_papers ? n_papers.toLocaleString("en-US") : 0;
    } else {
      return (
        Math.round(((n_included + n_excluded) / n_papers) * 10000) / 100 + "%"
      );
    }
  }, [props.isSimulating, props.mode, n_included, n_excluded, n_papers]);

  const seriesArray = React.useCallback(() => {
    if (n_papers) {
      return [
        Math.round(((n_unique) / n_papers) * 10000) / 100,
        Math.round((n_duplicates / n_papers) * 10000) / 100,
      ];
    } else {
      return [];
    }
  }, [n_unique, n_duplicates, n_papers]);

  const seriesArray2 = React.useCallback(() => {
    if (n_papers) {
      return [
        Math.round(((n_has_title) / n_papers) * 10000) / 100,
        Math.round((n_missing_title / n_papers) * 10000) / 100,
      ];
    } else {
      return [];
    }
  }, [n_has_title, n_missing_title, n_papers]);

  const seriesArray3 = React.useCallback(() => {
    if (n_papers) {
      return [
        Math.round(((n_has_abstract) / n_papers) * 10000) / 100,
        Math.round((n_missing_abstract / n_papers) * 10000) / 100,
      ];
    } else {
      return [];
    }
  }, [n_has_abstract, n_missing_abstract, n_papers]);

  const seriesArray4 = React.useCallback(() => {
    if (n_papers) {
      return [
        Math.round(((n_english) / n_papers) * 10000) / 100,
        Math.round(( (n_papers - n_english) / n_papers) * 10000) / 100,
      ];
    } else {
      return [];
    }
  }, [n_english, n_papers]);

  const optionsChart = React.useCallback(() => {
  return {
    chart: {
      animations: {
        enabled: false,
      },
      background: "transparent",
      id: "ASReviewLABprogressChart",
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "60%",
        },
        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: !props.mobileScreen
              ? theme.typography.h5.fontSize
              : theme.typography.h6.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.h5.fontFamily
              : theme.typography.h6.fontFamily,
            fontWeight: theme.typography.fontWeightBold,
          },
          total: {
            show: true,
            label:
              props.mode !== projectModes.SIMULATION || !props.isSimulating
                ? "Total records"
                : "Simulation progress",
            fontSize: !props.mobileScreen
              ? theme.typography.subtitle1.fontSize
              : theme.typography.subtitle2.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.subtitle1.fontFamily
              : theme.typography.subtitle2.fontFamily,
            color: theme.palette.text.secondary,
            formatter: formattedTotal,
          },
        },
      },
    },
    colors: [
      theme.palette.mode === "light"
        ? theme.palette.secondary.light
        : theme.palette.secondary.main,
      theme.palette.mode === "light"
        ? theme.palette.primary.light
        : theme.palette.primary.main,
    ],
    dataLabels: {
      enabled: false,
    },
    labels: ["Unique", "Duplicate"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: !props.mobileScreen ? "14px" : "12px",
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
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0,
        inverseColors: true,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
    },
    noData: {
      text: "No data available",
    },
    stroke: {
      lineCap: "round",
    },
    theme: {
      mode: theme.palette.mode,
    },
  };
});

const optionsChart2 = React.useCallback(() => {
  return {
    chart: {
      animations: {
        enabled: false,
      },
      background: "transparent",
      id: "ASReviewLABprogressChart",
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "60%",
        },
        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: !props.mobileScreen
              ? theme.typography.h5.fontSize
              : theme.typography.h6.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.h5.fontFamily
              : theme.typography.h6.fontFamily,
            fontWeight: theme.typography.fontWeightBold,
          },
          total: {
            show: true,
            label:
              props.mode !== projectModes.SIMULATION || !props.isSimulating
                ? "Total records"
                : "Simulation progress",
            fontSize: !props.mobileScreen
              ? theme.typography.subtitle1.fontSize
              : theme.typography.subtitle2.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.subtitle1.fontFamily
              : theme.typography.subtitle2.fontFamily,
            color: theme.palette.text.secondary,
            formatter: formattedTotal,
          },
        },
      },
    },
    colors: [
      theme.palette.mode === "light"
        ? theme.palette.secondary.light
        : theme.palette.secondary.main,
      theme.palette.mode === "light"
        ? theme.palette.primary.light
        : theme.palette.primary.main,
    ],
    dataLabels: {
      enabled: false,
    },
    labels: ["Has title", "No title"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: !props.mobileScreen ? "14px" : "12px",
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
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0,
        inverseColors: true,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
    },
    noData: {
      text: "No data available",
    },
    stroke: {
      lineCap: "round",
    },
    theme: {
      mode: theme.palette.mode,
    },
  };
});

const optionsChart3 = React.useCallback(() => {
  return {
    chart: {
      animations: {
        enabled: false,
      },
      background: "transparent",
      id: "ASReviewLABprogressChart",
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "60%",
        },
        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: !props.mobileScreen
              ? theme.typography.h5.fontSize
              : theme.typography.h6.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.h5.fontFamily
              : theme.typography.h6.fontFamily,
            fontWeight: theme.typography.fontWeightBold,
          },
          total: {
            show: true,
            label:
              props.mode !== projectModes.SIMULATION || !props.isSimulating
                ? "Total records"
                : "Simulation progress",
            fontSize: !props.mobileScreen
              ? theme.typography.subtitle1.fontSize
              : theme.typography.subtitle2.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.subtitle1.fontFamily
              : theme.typography.subtitle2.fontFamily,
            color: theme.palette.text.secondary,
            formatter: formattedTotal,
          },
        },
      },
    },
    colors: [
      theme.palette.mode === "light"
        ? theme.palette.secondary.light
        : theme.palette.secondary.main,
      theme.palette.mode === "light"
        ? theme.palette.primary.light
        : theme.palette.primary.main,
    ],
    dataLabels: {
      enabled: false,
    },
    labels: ["Has abstract", "No abstract"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: !props.mobileScreen ? "14px" : "12px",
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
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0,
        inverseColors: true,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
    },
    noData: {
      text: "No data available",
    },
    stroke: {
      lineCap: "round",
    },
    theme: {
      mode: theme.palette.mode,
    },
  };
});

const optionsChart4 = React.useCallback(() => {
  return {
    chart: {
      animations: {
        enabled: false,
      },
      background: "transparent",
      id: "ASReviewLABprogressChart",
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "60%",
        },
        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: !props.mobileScreen
              ? theme.typography.h5.fontSize
              : theme.typography.h6.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.h5.fontFamily
              : theme.typography.h6.fontFamily,
            fontWeight: theme.typography.fontWeightBold,
          },
          total: {
            show: true,
            label:
              props.mode !== projectModes.SIMULATION || !props.isSimulating
                ? "Total records"
                : "Simulation progress",
            fontSize: !props.mobileScreen
              ? theme.typography.subtitle1.fontSize
              : theme.typography.subtitle2.fontSize,
            fontFamily: !props.mobileScreen
              ? theme.typography.subtitle1.fontFamily
              : theme.typography.subtitle2.fontFamily,
            color: theme.palette.text.secondary,
            formatter: formattedTotal,
          },
        },
      },
    },
    colors: [
      theme.palette.mode === "light"
        ? theme.palette.secondary.light
        : theme.palette.secondary.main,
      theme.palette.mode === "light"
        ? theme.palette.primary.light
        : theme.palette.primary.main,
    ],
    dataLabels: {
      enabled: false,
    },
    labels: ["English", "Non English"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: !props.mobileScreen ? "14px" : "12px",
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
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0,
        inverseColors: true,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
    },
    noData: {
      text: "No data available",
    },
    stroke: {
      lineCap: "round",
    },
    theme: {
      mode: theme.palette.mode,
    },
  };
});

  const [series, setSeries] = React.useState(seriesArray());
  const [options, setOptions] = React.useState({});
  const [options2, setOptions2] = React.useState({});
  const [series2, setSeries2] = React.useState(seriesArray2());
  const [options3, setOptions3] = React.useState({});
  const [series3, setSeries3] = React.useState(seriesArray3());
  const [options4, setOptions4] = React.useState({});
  const [series4, setSeries4] = React.useState(seriesArray4());

  React.useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());

    setSeries2(seriesArray2());
    setOptions2(optionsChart2());

    setSeries3(seriesArray3());
    setOptions3(optionsChart3());

    setSeries4(seriesArray4());
    setOptions4(optionsChart4());
    
  }, [seriesArray, optionsChart, seriesArray2, optionsChart2, seriesArray3, optionsChart3 , seriesArray4, optionsChart4]);

  return (
    <Root>
      <Card
        elevation={3}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        }}
      >
        <CardContent>
          <Box
            className={classes.cardOverlay}
            sx={{
              bgcolor: "transparent",
            }}
          />
          <Stack spacing={2}>
            <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Dataset filename
              </Typography>
              <Typography variant="body2">{dataset_path}</Typography>
            </Stack>

            <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Records
              </Typography>
              <Typography variant="body2">{data?.n_rows}</Typography>
            </Stack>

            <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Duplicates
              </Typography>
              <Typography variant="body2">
                About {data?.n_duplicates} ({(Math.round((data?.n_duplicates/data?.n_rows*100)*100)/100).toFixed(2)}%)
              </Typography>
              </Stack>

              <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Missing titles
              </Typography>
              <Typography variant="body2">
                {data?.n_missing_title}
              </Typography>
              </Stack>

              <Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Missing abstracts
              </Typography>
              <Typography variant="body2">
                {data?.n_missing_abstract}
              </Typography>
              </Stack>

            <Box style={{display: 'flex', justifyContent: 'space-between'}}>
              <Chart
          options={options}
          series={series}
          type="radialBar"
          height={350}
          style={{flex: 1}}
        />

<Chart
          options={options2}
          series={series2}
          type="radialBar"
          height={350}
          style={{flex: 1}}
        />

<Chart
          options={options3}
          series={series3}
          type="radialBar"
          height={350}
          style={{flex: 1}}
        />
<Chart
          options={options4}
          series={series4}
          type="radialBar"
          height={350}
          style={{flex: 1}}
        />
        </Box>

          </Stack>

          {isFetchingData && (
            <Box className="main-page-body-wrapper">
              <CircularProgress />
            </Box>
          )}
          <CardErrorHandler
            queryKey={"fetchData"}
            error={fetchDataError}
            isError={isFetchDataError}
          />

          <Button
            sx={{ m: 2, display: "inline", float: "right" }}
            color="warning"
            onClick={() => {
              deleteProject({ project_id: project_id });
            }}
          >
            Change dataset
          </Button>
        </CardContent>
      </Card>
    </Root>
  );
};

export default DatasetInfo;
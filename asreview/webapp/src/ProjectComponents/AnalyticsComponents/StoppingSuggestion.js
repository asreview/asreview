import { DoneAll } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid2 as Grid,
  IconButton,
  LinearProgress,
  Paper,
  Popover,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ProjectAPI } from "api";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import StoppingReachedDialog from "../ReviewComponents/StoppingReachedDialog";

const StoppingSuggestion = ({ project_id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [stoppingRuleThreshold, setStoppingRuleThreshold] =
    React.useState(null);
  const [customThreshold, setCustomThreshold] = React.useState("");
  const [isThresholdSet, setIsThresholdSet] = React.useState(null);
  const [anchorElEdit, setAnchorElEdit] = React.useState(null);
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [showStoppingDialog, setShowStoppingDialog] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  const { data: projectData } = useQuery(
    ["fetchData", { project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data, isLoading } = useQuery(
    ["fetchStopping", { project_id: project_id }],
    ProjectAPI.fetchStopping,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const hasThreshold = Boolean(data?.params?.n);
        setIsThresholdSet(hasThreshold);

        if (hasThreshold) {
          setStoppingRuleThreshold(data.params.n);
        }
      },
    },
  );

  const { mutate: updateStoppingRule } = useMutation(
    ProjectAPI.mutateStopping,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries([
          "fetchStopping",
          { project_id: project_id },
        ]);
        setIsThresholdSet(true);
        handleCloseEdit();
      },
    },
  );

  React.useEffect(() => {
    if (data && data?.value && data?.params?.n) {
      const targetValue = Math.min((data.value / data.params.n) * 100, 100);
      let start;

      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const currentValue = Math.min(
          (progress / 300) * targetValue,
          targetValue,
        );

        setProgress(currentValue);

        if (currentValue < targetValue) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [data]);

  const handleCloseEdit = () => setAnchorElEdit(null);

  const openEdit = Boolean(anchorElEdit);

  const legendData = [
    {
      label: "Threshold",
      value: data?.params?.n || 0,
      color: theme.palette.grey[400],
      type: "stopping",
    },
    {
      label: "Current",
      value: data?.value || 0,
      color: theme.palette.grey[600],
    },
  ];

  const handleHelpPopoverOpen = (event) => {
    setAnchorElInfo(event.currentTarget);
  };

  const handleHelpPopoverClose = () => {
    setAnchorElInfo(null);
  };

  const StaticProgressBar = ({ value }) => {
    return (
      <Box
        sx={{ position: "relative", width: 60, transform: "rotate(270deg)" }}
      >
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 60,
            minWidth: 60,
            borderRadius: 50,
            backgroundColor: theme.palette.grey[400],
            "& .MuiLinearProgress-bar": {
              backgroundColor: theme.palette.grey[600],
              borderRadius: 50,
            },
          }}
        />
        {value === 100 && (
          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(90deg)",
              color: theme.palette.grey[400],
            }}
          >
            <DoneAll sx={{ fontSize: 30 }} />
          </IconButton>
        )}
      </Box>
    );
  };

  const handleStoppingCircleClick = () => {
    if (progress >= 100) {
      setShowStoppingDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowStoppingDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Card sx={{ position: "relative", bgcolor: "transparent" }}>
      <CardContent sx={{ mt: 4 }}>
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <IconButton size="small" onClick={handleHelpPopoverOpen}>
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>

        {isLoading || isThresholdSet === null ? (
          <Grid container spacing={2} columns={2}>
            <Grid size={1}>
              <Stack spacing={2} pt={4}>
                <Skeleton
                  variant="rectangular"
                  height={30}
                  sx={{ borderRadius: 3 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={30}
                  sx={{ borderRadius: 3 }}
                />
              </Stack>
            </Grid>
            <Grid
              size={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                width={160}
                height={160}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Skeleton
                  variant="circular"
                  width={160}
                  height={160}
                  sx={{ borderRadius: "50%" }}
                />
              </Box>
            </Grid>
          </Grid>
        ) : !isThresholdSet ? (
          <Grid container spacing={2} columns={2}>
            <Grid
              size={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="small"
                onClick={(event) => {
                  setAnchorElEdit(event.currentTarget);
                }}
                startIcon={<EditIcon />}
              >
                Set Threshold
              </Button>
            </Grid>
            <Grid
              size={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.grey[400],
                }}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2} columns={2}>
            <Grid size={1}>
              <Stack mt={3} spacing={2}>
                {legendData.map((item, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      backgroundColor: "transparent",
                    }}
                  >
                    {item.type !== "stopping" && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: item.color,
                          borderRadius: "50%",
                          mr: 2,
                        }}
                      />
                    )}
                    {item.type === "stopping" && (
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          setAnchorElEdit(event.currentTarget);
                        }}
                        color="primary"
                        sx={{ p: 0, mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      fontWeight="bold"
                    >
                      {item.value}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Grid>
            <Grid
              size={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                width={160}
                sx={{
                  transform: "rotate(270deg)",
                  position: "relative",
                  cursor: progress >= 100 ? "pointer" : "default",
                }}
                onClick={handleStoppingCircleClick}
              >
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 160,
                    minWidth: 160,
                    borderRadius: 50,
                    backgroundColor: theme.palette.grey[400],
                    transition: "value 1s linear",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: theme.palette.grey[600],
                      borderRadius: 50,
                    },
                  }}
                />
                {progress >= 100 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(90deg)",
                      color: theme.palette.grey[400],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DoneAll sx={{ fontSize: 50 }} />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
      <Popover
        open={Boolean(anchorElInfo)}
        anchorEl={anchorElInfo}
        onClose={handleHelpPopoverClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 375,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Stopping Suggestion
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "justify", mb: 2 }}>
                This visualization shows how far you are from the end. It allows
                you to set a stopping threshold, which is the number of
                consecutive not relevant records you need to label before
                stopping.
              </Typography>
              <Divider sx={{ mb: 2.5, mt: 1 }} />
              <Stack spacing={2.5} sx={{ mt: 1.5, mb: 2.5 }}>
                {[
                  {
                    title: "Setting the threshold",
                    desc: "Choose how many consecutive 'Not Relevant' records you need to label before stopping",
                  },
                  {
                    title: "Progress & Reset",
                    desc: "The stopping circle fills as you keep finding 'Not Relevant' records in a row. Finding relevant records resets the circle to zero",
                  },
                  {
                    title: "Stopping",
                    desc: "When you reach your threshold, a dialog will appear with multiple options: finish project, review more records, or continue with a different model",
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        minWidth: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        bgcolor: "#87766c",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        flexShrink: 0,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", mb: 0.5 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: "justify" }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Example Visualization
              </Typography>
              <Stack
                spacing={1}
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                {[0, 30, 70, 100].map((value) => (
                  <Box
                    key={value}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <StaticProgressBar value={value} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, textAlign: "center" }}
                    >
                      {value}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box sx={{ mt: 1 }}>
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
      <Popover
        id="threshold-popover"
        open={openEdit}
        anchorEl={anchorElEdit}
        onClose={handleCloseEdit}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 320,
            boxShadow: (theme) => theme.shadows[3],
          },
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Threshold options tabs"
            variant="fullWidth"
          >
            <Tab
              label="Custom"
              id="tab-custom"
              aria-controls="tabpanel-custom"
            />
            <Tab
              label="Percentage"
              id="tab-percentage"
              aria-controls="tabpanel-percentage"
            />
          </Tabs>
        </Box>

        <Box
          role="tabpanel"
          hidden={tabValue !== 0}
          id="tabpanel-custom"
          aria-labelledby="tab-custom"
          sx={{ p: 2.5 }}
        >
          {tabValue === 0 && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight="medium">
                Set Custom Threshold
              </Typography>
              <TextField
                type="number"
                label="Custom threshold"
                placeholder="Enter value"
                value={customThreshold}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 0) {
                    setCustomThreshold(value);
                    setStoppingRuleThreshold(null);
                  } else if (e.target.value === "") {
                    setCustomThreshold("");
                  }
                }}
                fullWidth
                size="medium"
                autoFocus
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (customThreshold !== null && customThreshold !== "") {
                    updateStoppingRule({
                      project_id: project_id,
                      n: customThreshold,
                    });
                  }
                }}
                fullWidth
                disabled={customThreshold === "" || customThreshold === null}
              >
                Save
              </Button>
              <Box sx={{ mt: "auto" }}>
                <Button
                  href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  Learn more
                </Button>
              </Box>
            </Stack>
          )}
        </Box>

        <Box
          role="tabpanel"
          hidden={tabValue !== 1}
          id="tabpanel-percentage"
          aria-labelledby="tab-percentage"
          sx={{ p: 2.5 }}
        >
          {tabValue === 1 && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight="medium">
                Select a Percentage of your Dataset
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="space-between">
                {[1, 2, 5, 10].map((percent) => {
                  const value = Math.round(
                    projectData?.n_rows * (percent / 100),
                  );
                  return (
                    <Box
                      key={percent}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flexGrow: 1,
                      }}
                    >
                      <Button
                        variant={
                          stoppingRuleThreshold === value
                            ? "contained"
                            : "outlined"
                        }
                        fullWidth
                        size="small"
                        onClick={() => {
                          setStoppingRuleThreshold(value);
                          setCustomThreshold("");
                        }}
                      >
                        {`${percent}%`}
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              <Button
                variant="contained"
                onClick={() => {
                  if (
                    stoppingRuleThreshold !== null &&
                    stoppingRuleThreshold !== ""
                  ) {
                    updateStoppingRule({
                      project_id: project_id,
                      n: stoppingRuleThreshold,
                    });
                  }
                }}
                fullWidth
                disabled={stoppingRuleThreshold === null}
              >
                Save
              </Button>
              <Box sx={{ mt: "auto" }}>
                <Button
                  href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  Learn more
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Popover>
      <StoppingReachedDialog
        open={showStoppingDialog}
        onClose={handleCloseDialog}
        project_id={project_id}
      />
    </Card>
  );
};

export default StoppingSuggestion;

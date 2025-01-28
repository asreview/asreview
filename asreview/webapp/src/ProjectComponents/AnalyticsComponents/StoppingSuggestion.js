import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import ArticleIcon from "@mui/icons-material/Article";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  IconButton,
  Paper,
  Popover,
  Skeleton,
  Stack,
  TextField,
  Typography,
  LinearProgress,
  Dialog,
  Divider,
  MenuItem,
  Select,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ProjectAPI } from "api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { projectStatuses } from "globals.js";

const StoppingSuggestion = ({ project_id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [stoppingRuleThreshold, setStoppingRuleThreshold] =
    React.useState(null);
  const [customThreshold, setCustomThreshold] = React.useState("");
  const [isThresholdSet, setIsThresholdSet] = React.useState(null);
  const [anchorElEdit, setAnchorElEdit] = React.useState(null);
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);
  const [openCompletionPopup, setOpenCompletionPopup] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

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
          if (data?.value >= data?.params?.n) {
            setOpenCompletionPopup(true);
          }
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
      const targetValue = (data.value / data.params.n) * 100;
      setProgress(0);

      const duration = 300;
      const intervalTime = 10;
      const increment = targetValue / (duration / intervalTime);
      let currentProgress = 0;

      const timer = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= targetValue) {
          currentProgress = targetValue;
          clearInterval(timer);
        }
        setProgress(currentProgress);
      }, intervalTime);

      return () => clearInterval(timer);
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
      color: theme.palette.primary.main,
    },
  ];

  const { mutate } = useMutation(ProjectAPI.mutateReviewStatus, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["fetchProjectStatus", { project_id }]);
      queryClient.invalidateQueries(["fetchProjectInfo", { project_id }]);
    },
  });

  const handleFinishProject = () => {
    mutate({
      project_id: project_id,
      status: projectStatuses.FINISHED,
    });
    setOpenCompletionPopup(false);
  };

  const handleSelectDifferentModel = () => {
    mutate({
      project_id: project_id,
      status: projectStatuses.REVIEW,
    });
    navigate(`/reviews/${project_id}/settings`);
    setOpenCompletionPopup(false);
  };

  const handleRemindLater = () => {
    mutate({
      project_id: project_id,
      status: projectStatuses.REVIEW,
    });
    updateStoppingRule({
      project_id: project_id,
      threshold: stoppingRuleThreshold + 20,
    });
    setOpenCompletionPopup(false);
  };

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
              backgroundColor: theme.palette.primary.main,
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
            <DoneRoundedIcon sx={{ fontSize: 30 }} />
          </IconButton>
        )}
      </Box>
    );
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
              sx={{ textAlign: "center" }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Choose the number of{" "}
                <strong>
                  consecutive not relevant records you want to label
                </strong>{" "}
                before considering to stop screening.
              </Typography>
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
                onClick={() => progress >= 100 && setOpenCompletionPopup(true)}
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
                      backgroundColor: theme.palette.primary.main,
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
                    <DoneRoundedIcon sx={{ fontSize: 50 }} />
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
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Stopping Suggestion
              </Typography>
              <Typography variant="body2">
                This visualization shows how far you are from the end. It allows
                you to set a stopping threshold, which is the number of
                consecutive not relevant records you label before deciding to
                stop screening. The more not relevant records you label without
                finding relevant ones, the higher the chance that remaining
                records are also not relevant.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Threshold Editing
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <EditIcon fontSize="small" />
                <Typography variant="body2">
                  You can manually edit and optimize the threshold for your
                  project to determine when this suggestion appears.
                </Typography>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Example Visualization
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 1 }}
              ></Typography>

              <Stack spacing={1} direction="row" alignItems="center">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <StaticProgressBar value={0} />
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <StaticProgressBar value={30} />
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <StaticProgressBar value={70} />
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <StaticProgressBar value={100} />
                </Box>
              </Stack>
            </Box>
            <Button
              href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
              sx={{ textTransform: "none", p: 0 }}
            >
              Learn more →
            </Button>
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
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Edit Threshold
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter a custom value, or choose a dynamic or static threshold
                from the dropdown menu.
              </Typography>
            </Box>
            <Divider />
            <TextField
              type="number"
              label="Custom Value"
              placeholder="Enter custom threshold"
              value={customThreshold}
              onClick={() => {
                if (stoppingRuleThreshold !== null) {
                  setStoppingRuleThreshold(null);
                }
              }}
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
              size="small"
              sx={{ mt: 2 }}
            />
            <Select
              value={stoppingRuleThreshold || ""}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setStoppingRuleThreshold(selectedValue);
                setCustomThreshold("");
              }}
              fullWidth
              displayEmpty
              sx={{
                ".MuiSelect-select": {
                  py: 1.25,
                  borderRadius: 1,
                },
                ".MuiMenuItem-root": {
                  fontSize: 14,
                  py: 1,
                },
                ".MuiMenuItem-root.Mui-selected": {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    py: 0.5,
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                Select a Value
              </MenuItem>
              <MenuItem
                disabled
                sx={{
                  pointerEvents: "none",
                  fontSize: 12,
                  color: "text.secondary",
                  opacity: 0.8,
                }}
              >
                Dynamic Values
              </MenuItem>
              {[
                { percent: 5, value: Math.round(projectData?.n_rows * 0.05) },
                { percent: 10, value: Math.round(projectData?.n_rows * 0.1) },
                { percent: 15, value: Math.round(projectData?.n_rows * 0.15) },
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {`${option.value} (${option.percent}% of records)`}
                </MenuItem>
              ))}
              <MenuItem
                disabled
                sx={{
                  pointerEvents: "none",
                  fontSize: 12,
                  color: "text.secondary",
                  opacity: 0.8,
                  mt: 1,
                }}
              >
                Static Values
              </MenuItem>
              {[100, 150, 200, 250, 300].map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Select>
            <Divider />
            <Button
              variant="contained"
              onClick={() => {
                const finalThreshold = customThreshold || stoppingRuleThreshold;
                if (finalThreshold !== null && finalThreshold !== "") {
                  updateStoppingRule({
                    project_id: project_id,
                    n: finalThreshold,
                  });
                }
              }}
              fullWidth
            >
              Save
            </Button>
            <Button
              href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
              sx={{ textTransform: "none", p: 0 }}
            >
              Learn more →
            </Button>
          </Stack>
        </Box>
      </Popover>
      <Dialog
        open={openCompletionPopup}
        onClose={() => setOpenCompletionPopup(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                fontWeight="bold"
                sx={{ fontFamily: "Roboto Serif", mt: 1, fontSize: 24 }}
                align="center"
              >
                Stopping suggestion reached,
              </Typography>
              <Typography
                fontWeight="bold"
                sx={{ fontFamily: "Roboto Serif", mb: 3, fontSize: 24 }}
                align="center"
              >
                how do you want to proceed?
              </Typography>
              <Typography variant="body2">
                You've reached your stopping threshold for this project. This
                indicates that all relevant records have likely been found. You
                can always return to this menu by clicking on the stopping
                circle.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Available Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  onClick={handleFinishProject}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 1,
                    textTransform: "none",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    width="100%"
                  >
                    <DoneRoundedIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Mark Project as Finished
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete your review and export your results
                      </Typography>
                    </Box>
                  </Stack>
                </Button>

                <Button
                  onClick={handleSelectDifferentModel}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 1,
                    textTransform: "none",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    width="100%"
                  >
                    <SettingsIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Continue with Different Model
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Switch to an alternative model for further screening
                      </Typography>
                    </Box>
                  </Stack>
                </Button>

                <Button
                  onClick={handleRemindLater}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 1,
                    textTransform: "none",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    width="100%"
                  >
                    <ArticleIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Review 20 More Records
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Continue screening with an increased threshold
                      </Typography>
                    </Box>
                  </Stack>
                </Button>
              </Stack>
            </Box>
            <Divider />
            <Button
              href="https://github.com/asreview/asreview/discussions/557"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: "none", p: 0 }}
            >
              Learn more about stopping →
            </Button>

            <Box align="center" mt={2}>
              <Button
                onClick={() => setOpenCompletionPopup(false)}
                variant="contained"
                sx={{ textTransform: "none" }}
              >
                Close
              </Button>
            </Box>
          </Stack>
        </Box>
      </Dialog>
    </Card>
  );
};

export default StoppingSuggestion;

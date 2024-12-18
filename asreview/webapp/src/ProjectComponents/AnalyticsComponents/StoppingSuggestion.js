import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import ArticleIcon from "@mui/icons-material/Article";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  IconButton,
  Link,
  Paper,
  Popover,
  Skeleton,
  Stack,
  TextField,
  Typography,
  LinearProgress,
  Dialog,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ProjectAPI } from "api";
import { useMutation, useQuery, useQueryClient } from "react-query";

const StoppingSuggestion = ({ project_id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [stoppingRuleThreshold, setStoppingRuleThreshold] =
    React.useState(null);

  const [anchorElEdit, setAnchorElEdit] = React.useState(null);
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);
  const [openCompletionPopup, setOpenCompletionPopup] = React.useState(false);

  const [progress, setProgress] = React.useState(0);

  const { data, isLoading } = useQuery(
    ["fetchStopping", { project_id: project_id }],
    ProjectAPI.fetchStopping,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setStoppingRuleThreshold(data[0]?.params.threshold);

        if (data[0]?.value >= data[0]?.params?.threshold) {
          setOpenCompletionPopup(true);
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
        handleCloseEdit();
      },
    },
  );

  React.useEffect(() => {
    if (data && data[0]?.value && data[0]?.params?.threshold) {
      const targetValue = (data[0].value / data[0].params.threshold) * 100;
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
      value: data?.[0]?.params?.threshold || 0,
      color: theme.palette.grey[400],
      type: "stopping",
    },
    {
      label: "Current",
      value: data?.[0]?.value || 0,
      color: theme.palette.primary.main,
    },
  ];

  // Dummy handlers - we can implement actual functionality as needed
  const handleFinishProject = () => {
    console.log("Finish Project clicked");
    setOpenCompletionPopup(false);
  };

  const handleSelectDifferentModel = () => {
    console.log("Select Different Model clicked");
    setOpenCompletionPopup(false);
  };

  const handleRemindLater = () => {
    console.log("Remind Me Again 20 Papers Later clicked");
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
            <LightbulbOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Grid container spacing={2} columns={2}>
          <Grid size={1}>
            {isLoading ? (
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
            ) : (
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
            )}
          </Grid>
          <Grid
            size={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {isLoading ? (
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
            ) : (
              <Box width={160} sx={{ transform: "rotate(270deg)" }}>
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
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(90deg)",
                      color: theme.palette.grey[400],
                    }}
                    onClick={() => setOpenCompletionPopup(true)}
                  >
                    <DoneRoundedIcon
                      sx={{
                        fontSize: 50,
                      }}
                    />
                  </IconButton>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
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
                This visualization shows how far you are from the end. This
                helps you decide when to stop screening additional records. More
                irrelevant records you label without finding any relevant ones,
                the higher the likelihood that the remaining records are also
                irrelevant.
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
            <Box>
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
            p: 2.5,
          },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Edit Threshold
        </Typography>
        <TextField
          type="number"
          label="Threshold"
          value={stoppingRuleThreshold}
          onChange={(e) => {
            setStoppingRuleThreshold(e.target.value);
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={() =>
            updateStoppingRule({
              project_id: project_id,
              id: "n_since_last_included",
              threshold: stoppingRuleThreshold,
            })
          }
          fullWidth
        >
          Save
        </Button>
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
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Stopping Suggestion Reached
              </Typography>
              <Typography variant="body2">
                You've reached your stopping threshold for this project. This
                indicates that all relevant records have likely been found. How
                do you want to proceed?
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Available Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  onClick={() => {
                    handleFinishProject();
                    setOpenCompletionPopup(false);
                  }}
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
                  onClick={() => {
                    handleSelectDifferentModel();
                    setOpenCompletionPopup(false);
                  }}
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
                  onClick={() => {
                    updateStoppingRule({
                      project_id: project_id,
                      id: "n_since_last_included",
                      threshold: stoppingRuleThreshold + 20,
                    });
                    setOpenCompletionPopup(false);
                  }}
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

            <Box>
              <Button
                href="https://github.com/asreview/asreview/discussions/557"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", p: 0 }}
              >
                Learn more about stopping →
              </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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

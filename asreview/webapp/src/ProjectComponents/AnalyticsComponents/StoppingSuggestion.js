import React from "react";

import EditIcon from "@mui/icons-material/Edit";
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
  DialogTitle,
  DialogContent,
  DialogActions,
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
      setProgress(0); // Reset progress to 0

      const duration = 300; // Animation duration in milliseconds
      const intervalTime = 10; // Interval time in milliseconds
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

      return () => clearInterval(timer); // Cleanup on unmount or data change
    }
  }, [data]);

  const handleCloseEdit = () => setAnchorElEdit(null);

  const openEdit = Boolean(anchorElEdit);

  // console.log(data[0]?.value, data[0]?.params?.threshold);
  const legendData = React.useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Threshold",
        value: data[0]?.params?.threshold || 0,
        color: theme.palette.grey[400],
        type: "stopping",
      },
      {
        label: "Current",
        value: data[0]?.value || 0,
        color: theme.palette.primary.main,
      },
    ];
  }, [data, theme.palette.grey, theme.palette.primary.main]);

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

  return (
    <Card
      sx={{
        position: "relative",
        bgcolor: "background.default",
      }}
    >
      <CardContent>
        <Popover
          id="info-popover"
          open={Boolean(anchorElInfo)}
          anchorEl={anchorElInfo}
          onClose={() => setAnchorElInfo(null)}
        >
          <Box>
            <Typography variant="body1">
              <strong>Stopping Suggestion</strong>
            </Typography>
            <Typography variant="body2" mt={1}>
              This feature helps you decide when to stop screening additional
              records. The more irrelevant records you label without
              encountering any relevant ones, the higher the likelihood that the
              remaining records are also irrelevant.
            </Typography>
            <Typography variant="body2" mt={1}>
              You can manually edit and optimize the threshold for your project.
            </Typography>
            <Box mt={2}>
              <Link
                href="https://github.com/asreview/asreview/discussions/557"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
                Learn more
              </Link>
            </Box>
          </Box>
        </Popover>
        <Grid container spacing={2} columns={2}>
          <Grid size={1}>
            {isLoading ? (
              <Stack spacing={2} pt={4}>
                <Skeleton
                  variant="rectangular"
                  height={30}
                  sx={{ borderRadius: 3}}
                />
                <Skeleton
                  variant="rectangular"
                  height={30}
                  sx={{ borderRadius: 3}}
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
                          mr: 1,
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
                        sx={{ p: 0, mr: 0 }}
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
            alignItems="center"
            justifyContent="center"
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
                  sx={{ borderRadius: '50%' }}
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
                    transition: "value 1s linear", // Optional: Smooth transition
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 50,
                    },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
      <Popover
        id="threshold-popover"
        open={openEdit}
        anchorEl={anchorElEdit}
        onClose={handleCloseEdit}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Edit Threshold
          </Typography>
          <TextField
            type="number"
            // value={data[0]?.params.threshold}
            label="Threshold"
            value={stoppingRuleThreshold}
            onChange={(e) => {
              setStoppingRuleThreshold(e.target.value);
            }}
            fullWidth
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
        </Box>
      </Popover>
      {/* Completion Pop-up Dialog */}
      <Dialog
        open={openCompletionPopup}
        onClose={() => setOpenCompletionPopup(false)}
        aria-labelledby="completion-dialog-title"
        aria-describedby="completion-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          id="completion-dialog-title"
          sx={{
            textAlign: "center",
            marginBottom: theme.spacing(2),
          }}
        >
          <Typography variant="h6" color="text.primary">
            Stopping Suggestion Reached
          </Typography>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            padding: theme.spacing(3),
          }}
        >
          <Typography
            variant="body1"
            gutterBottom
            color="text.secondary"
            sx={{ textAlign: "center", marginBottom: theme.spacing(2) }}
          >
            How do you want to proceed?
          </Typography>
          <Stack spacing={2}>
            <Box
              display="flex"
              alignItems="center"
              position="relative"
              sx={{
                cursor: "pointer",
                "&:hover .circle": {
                  opacity: 0.8,
                },
              }}
              onClick={handleFinishProject}
            >
              <Box
                className="circle"
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  bgcolor: "grey.600",
                  borderRadius: "8px",
                  zIndex: 0,
                  opacity: 1,
                }}
              />
              <Typography
                variant="body2"
                color="background.default"
                sx={{
                  zIndex: 1,
                  position: "relative",
                  padding: theme.spacing(1.5, 2),
                  width: "100%",
                  fontWeight: "bold",
                }}
              >
                Finish Project
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              position="relative"
              sx={{
                cursor: "pointer",
                "&:hover .circle": {
                  opacity: 1,
                },
              }}
              onClick={handleSelectDifferentModel}
            >
              <Box
                className="circle"
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  bgcolor: theme.palette.primary.main,
                  borderRadius: "8px",
                  zIndex: 0,
                  opacity: 1,
                }}
              />
              <Typography
                variant="body2"
                color="background.default"
                sx={{
                  zIndex: 1,
                  position: "relative",
                  padding: theme.spacing(1.5, 2),
                  width: "100%",
                  fontWeight: "bold",
                }}
              >
                Select Different Model
              </Typography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              position="relative"
              sx={{
                cursor: "pointer",
                "&:hover .circle": {
                  opacity: 0.8,
                },
              }}
              onClick={handleRemindLater}
            >
              <Box
                className="circle"
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  bgcolor: "grey.400",
                  borderRadius: "8px",
                  zIndex: 0,
                  opacity: 0.6,
                }}
              />
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  zIndex: 1,
                  position: "relative",
                  padding: theme.spacing(1.5, 2),
                  width: "100%",
                  fontWeight: "bold",
                }}
              >
                Remind Me Again 20 Records Later
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StoppingSuggestion;

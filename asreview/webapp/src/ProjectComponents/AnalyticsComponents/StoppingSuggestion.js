import React from "react";

import EditIcon from "@mui/icons-material/Edit";
import ArticleIcon from "@mui/icons-material/Article";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import SettingsIcon from "@mui/icons-material/Settings";
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
import QuizOutlined from "@mui/icons-material/QuizOutlined";

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

  return (
    <Card
      sx={{
        position: "relative",
        bgcolor: "transparent",
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
      <Dialog
        open={openCompletionPopup}
        onClose={() => setOpenCompletionPopup(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: "center", pt: 6, pb: 6 }}>
          <Typography color="primary" variant="h6">
            Stopping Suggestion reached! What's next?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={5}>
            <Button
              startIcon={<DoneRoundedIcon />}
              onClick={handleFinishProject}
              sx={{ justifyContent: "flex-start" }}
            >
              Mark the Project as Finished
            </Button>

            <Button
              startIcon={<SettingsIcon />}
              onClick={handleSelectDifferentModel}
              sx={{ justifyContent: "flex-start" }}
            >
              Continue with a Different Model
            </Button>

            <Button
              startIcon={<ArticleIcon />}
              onClick={handleRemindLater}
              sx={{ justifyContent: "flex-start" }}
            >
              Remind Me Again 20 Records Later
            </Button>

            <Button
              startIcon={<QuizOutlined />}
              href="https://github.com/asreview/asreview/discussions/557"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ justifyContent: "flex-start" }}
            >
              What is stopping?
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenCompletionPopup(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default StoppingSuggestion;

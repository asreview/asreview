import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Popover,
  TextField,
  Button,
  Grid2 as Grid,
  Stack,
  Link,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useQuery } from "react-query";
import { ProjectAPI } from "api";

const StatItem = ({ label, value, color, loading }) => (
  <Box
    sx={{
      bgcolor: "background.paper",
      p: 1.5,
      borderRadius: 4,
      boxShadow: 3,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      mb: { xs: 1, sm: 2 },
    }}
  >
    {loading ? (
      <Skeleton width="40%" />
    ) : (
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    )}
    {loading ? (
      <Skeleton width="20%" />
    ) : (
      <Typography variant="h6" color={color} fontWeight="bold">
        {value.toLocaleString()}
      </Typography>
    )}
  </Box>
);

const StoppingSuggestion = ({ project_id }) => {
  const [stoppingRuleThreshold, setStoppingRuleThreshold] = useState(
    localStorage.getItem("stoppingRuleThreshold") || 30,
  );
  const [irrelevantCount, setIrrelevantCount] = useState(0);
  const [n_since_last_inclusion_no_priors, setNSinceLastInclusionNoPriors] =
    useState(0);

  // Separate anchor states for both popovers
  const [anchorElEdit, setAnchorElEdit] = useState(null);
  const [anchorElInfo, setAnchorElInfo] = useState(null);

  const [tempThreshold, setTempThreshold] = useState(stoppingRuleThreshold);

  const { data, isLoading } = useQuery(
    ["fetchProgress", { project_id: project_id }],
    ({ queryKey }) =>
      ProjectAPI.fetchProgress({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (localStorage.getItem("stoppingRuleThreshold")) {
      setStoppingRuleThreshold(
        Number(localStorage.getItem("stoppingRuleThreshold")),
      );
    }

    const { n_since_last_inclusion_no_priors } = data || {};
    setIrrelevantCount(n_since_last_inclusion_no_priors || 0);
    setNSinceLastInclusionNoPriors(n_since_last_inclusion_no_priors || 0);
  }, [data]);

  const handleClickEdit = (event) => {
    setAnchorElEdit(event.currentTarget);
    setTempThreshold(stoppingRuleThreshold);
  };

  const handleClickInfo = (event) => {
    setAnchorElInfo(event.currentTarget);
  };

  const handleCloseEdit = () => setAnchorElEdit(null);
  const handleCloseInfo = () => setAnchorElInfo(null);

  const handleSave = () => {
    setStoppingRuleThreshold(tempThreshold);
    localStorage.setItem("stoppingRuleThreshold", tempThreshold);
    handleCloseEdit();
  };

  const openEdit = Boolean(anchorElEdit);
  const openInfo = Boolean(anchorElInfo);

  const stoppingRuleProgress =
    (n_since_last_inclusion_no_priors / stoppingRuleThreshold) * 100;

  return (
    <Card
      sx={{
        position: "relative",
        bgcolor: "background.default",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Grid container spacing={2} columns={1}>
          <Box position="relative" display="inline-flex">
            {isLoading ? (
              <Skeleton variant="circular" width={120} height={120} />
            ) : (
              <CircularProgress
                variant="determinate"
                value={stoppingRuleProgress}
                size={120}
                thickness={6}
                sx={{
                  color: "primary.main",
                  borderRadius: "50%",
                  boxShadow: "0px 0px 10px 3px rgba(0, 0, 0, 0.2)",
                }}
              />
            )}
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h6" color="text.secondary" component="div">
                {`${Math.round(stoppingRuleProgress)}%`}
              </Typography>
            </Box>
          </Box>

          <Grid size={1}>
            <Stack spacing={2} direction={"row"}>
              <StatItem
                label="Not relevant since last relevant"
                value={n_since_last_inclusion_no_priors}
              />
              <StatItem
                label={
                  <>
                    {"Stopping suggestion"}{" "}
                    <IconButton
                      size="small"
                      onClick={handleClickEdit}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </>
                }
                value={tempThreshold}
              />
            </Stack>
          </Grid>

          <Box>
            <IconButton size="small" onClick={handleClickInfo}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>
      </CardContent>
      <Popover
        id="threshold-popover"
        open={openEdit}
        anchorEl={anchorElEdit}
        onClose={handleCloseEdit}
      >
        <Box p={3} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="subtitle1" gutterBottom>
            Edit Threshold
          </Typography>
          <TextField
            type="number"
            value={tempThreshold}
            onChange={(e) => setTempThreshold(Number(e.target.value))}
            size="small"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            fullWidth
          >
            Save
          </Button>
        </Box>
      </Popover>
      <Popover
        id="info-popover"
        open={openInfo}
        anchorEl={anchorElInfo}
        onClose={handleCloseInfo}
      >
        <Box>
          <Typography variant="body2" gutterBottom>
            <strong>Stopping Suggestion</strong>
          </Typography>
          <Typography variant="body2">
            This feature helps you decide when to stop screening additional
            records. The more irrelevant records you label without encountering
            any relevant ones, the higher the likelihood that the remaining
            records are also irrelevant.
          </Typography>
          <Typography variant="body2">
            You can manually edit and optimize the threshold for your project.
          </Typography>
          <Box>
            <Link
              component="a"
              href="https://github.com/asreview/asreview/discussions/557"
              sx={(theme) => ({ color: theme.palette.primary.main })}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Link>
          </Box>
        </Box>
      </Popover>
    </Card>
  );
};

export default StoppingSuggestion;

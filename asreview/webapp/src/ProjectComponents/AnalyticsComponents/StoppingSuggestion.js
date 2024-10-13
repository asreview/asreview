import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Popover,
  TextField,
  Button,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const StoppingSuggestion = ({ progressQuery }) => {
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
  const loading = progressQuery.isLoading;
  const theme = useTheme();

  useEffect(() => {
    if (localStorage.getItem("stoppingRuleThreshold")) {
      setStoppingRuleThreshold(
        Number(localStorage.getItem("stoppingRuleThreshold")),
      );
    }

    const { n_since_last_inclusion_no_priors } = progressQuery.data || {};
    setIrrelevantCount(n_since_last_inclusion_no_priors || 0);
    setNSinceLastInclusionNoPriors(n_since_last_inclusion_no_priors || 0);
  }, [progressQuery.data]);

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
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Box>
            {loading ? (
              <Skeleton width={100} height={40} />
            ) : (
              <Typography variant="h4" color="primary" fontWeight="bold">
                {`${irrelevantCount}/${stoppingRuleThreshold}`}
              </Typography>
            )}
            {loading ? (
              <Skeleton width={150} height={24} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Irrelevant since last Relevant
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center">
            {loading ? (
              <Skeleton width={150} height={40} />
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" mr={1}>
                  Threshold:
                </Typography>
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight="bold"
                  mr={1}
                >
                  {stoppingRuleThreshold}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleClickEdit}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        <Box position="relative" display="inline-flex">
          {loading ? (
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
        <Box>
          <IconButton size="small" onClick={handleClickInfo}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
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
            <a
              href="https://github.com/asreview/asreview/discussions/557"
              style={{ color: theme.palette.primary.main }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </Box>
        </Box>
      </Popover>
    </Card>
  );
};

export default StoppingSuggestion;

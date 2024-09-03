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
  Tooltip,
} from "@mui/material";
import { tooltipClasses } from "@mui/material/Tooltip";
import { styled, useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// Styled component for the main card
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 4,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[2],
  height: "300px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
}));

// Info tooltip
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(12),
    padding: "10px",
    borderRadius: theme.shape.borderRadius,
  },
}));

const StoppingSuggestion = ({ progressQuery }) => {
  const [stoppingRuleThreshold, setStoppingRuleThreshold] = useState(
    localStorage.getItem("stoppingRuleThreshold") || 30,
  );
  const [irrelevantCount, setIrrelevantCount] = useState(0);
  const [n_since_last_inclusion_no_priors, setNSinceLastInclusionNoPriors] =
    useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setTempThreshold(stoppingRuleThreshold);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSave = () => {
    setStoppingRuleThreshold(tempThreshold);
    localStorage.setItem("stoppingRuleThreshold", tempThreshold);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "threshold-popover" : undefined;

  const stoppingRuleProgress =
    (n_since_last_inclusion_no_priors / stoppingRuleThreshold) * 100;

  return (
    <StyledCard>
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
        >
          <Box mb={2}>
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
                <Tooltip
                  backgroundcolor="primary"
                  title={
                    <React.Fragment>
                      <Typography variant="body2" gutterBottom>
                        <strong>Edit Threshold</strong>
                      </Typography>
                    </React.Fragment>
                  }
                  arrow
                >
                  <IconButton
                    size="small"
                    onClick={handleClick}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
        <Box
          sx={{
            position: "absolute",
            top: theme.spacing(1),
            right: theme.spacing(1),
          }}
        >
          <CustomTooltip
            title={
              <React.Fragment>
                <hr
                  style={{
                    border: `none`,
                    borderTop: `4px solid ${theme.palette.divider}`,
                    margin: "8px 0",
                    borderRadius: "5px",
                  }}
                />
                <Typography variant="body2" gutterBottom>
                  <strong>Stopping Suggestion</strong>
                </Typography>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.2em",
                    listStyleType: "circle",
                  }}
                >
                  <li>
                    {" "}
                    This feature helps you decide when to stop screening
                    additional records.{" "}
                  </li>
                  <li>
                    {" "}
                    The more irrelevant records you label without encountering
                    any relevant ones, the higher the likelihood that the
                    remaining records are also irrelevant.{" "}
                  </li>

                  <li>
                    {" "}
                    You can manually edit and optimize the threshold for your
                    project.{" "}
                  </li>
                </ul>
                <hr
                  style={{
                    border: `none`,
                    borderTop: `4px solid ${theme.palette.divider}`,
                    margin: "8px 0",
                    borderRadius: "5px",
                  }}
                />

                <Box sx={{ pt: 1, textAlign: "center" }}>
                  <a
                    href="https://github.com/asreview/asreview/discussions/557"
                    style={{
                      color:
                        theme.palette.mode === "dark" ? "#1E90FF" : "#1E90FF",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                </Box>
              </React.Fragment>
            }
            arrow
            interactive={true}
            enterTouchDelay={0}
            sx={{
              color: theme.palette.text.secondary,
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2],
            }}
          >
            <IconButton
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                p: theme.spacing(2.1),
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </CustomTooltip>
        </Box>
      </CardContent>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
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
            sx={{ mb: 2, width: "100%" }}
            InputProps={{
              inputProps: { min: 0 },
            }}
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
    </StyledCard>
  );
};

export default StoppingSuggestion;

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Popover,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ProjectAPI } from "api";
import { useState } from "react";
import { useQuery } from "react-query";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

function MetricsInfoPopover({ open, anchorEl, onClose }) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxWidth: 320,
          },
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Progress metrics
            </Typography>
            <Typography variant="body2" align="justify">
              <strong>Loss</strong> measures how well the model ranks and finds
              the relevant records in the dataset. Lower values indicate better
              performance. A loss of 0 is ideal, meaning the model perfectly
              predicts the relevance of records.
            </Typography>
            <Typography variant="body2" align="justify" sx={{ mt: 1 }}>
              <strong>NDCG</strong> (Normalized Discounted Cumulative Gain)
              evaluates how well the model ranks relevant records higher in the
              screening order. Higher values indicate better ranking
              performance. A NDCG of 1 means the model presented all relevant
              records at the top.
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Availability
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, textAlign: "justify" }}>
              These metrics are only available when running a{" "}
              <strong>Simulation</strong> project, where the relevance labels of
              all records is known. In regular review projects, these metrics
              are not available.
            </Typography>
          </Box>
          <Box>
            <Button
              href="https://asreview.readthedocs.io/en/latest/lab/progress.html"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
            >
              Learn more
            </Button>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}

export default function Metrics({ project_id }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const popoverOpen = Boolean(anchorEl);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const { data, isLoading } = useQuery(
    ["fetchMetrics", { project_id }],
    ({ queryKey }) =>
      ProjectAPI.fetchMetrics({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );

  return (
    <Card sx={{ position: "relative", bgcolor: "transparent" }}>
      <CardContent sx={{ mt: 2 }}>
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <IconButton size="small" onClick={handlePopoverOpen}>
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 3 }}
        >
          <Card
            variant="outlined"
            sx={{
              minWidth: 140,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
            }}
          >
            <TrendingDownIcon color="tertiary" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="subtitle1" color="text.secondary">
              Loss
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {isLoading ? <Skeleton width={40} /> : data?.loss}
            </Typography>
          </Card>
          <Card
            variant="outlined"
            sx={{
              minWidth: 140,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
            }}
          >
            <TrendingUpIcon color="tertiary" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="subtitle1" color="text.secondary">
              NDCG
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {isLoading ? <Skeleton width={40} /> : data?.ndcg}
            </Typography>
          </Card>
        </Stack>
      </CardContent>
      <MetricsInfoPopover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
      />
    </Card>
  );
}

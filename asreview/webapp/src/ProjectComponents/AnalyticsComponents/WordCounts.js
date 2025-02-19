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
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const WordTag = ({ word, color = "primary.main" }) => (
  <Box
    sx={{
      borderRadius: 1.5,
      px: 1.5,
      py: 0.75,
      fontSize: "0.875rem",
      bgcolor: color,
      minWidth: 50,
      textAlign: "center",
      color: (theme) =>
        theme.palette.getContrastText(
          theme.palette[color.split(".")[0]][color.split(".")[1]] || color,
        ),
    }}
  >
    {word}
  </Box>
);

const WordExample = () => {
  const words = {
    relevant: ["systematic", "review", "trial", "clinical", "therapy"],
    irrelevant: ["animal", "cell", "mice", "vitro", "molecular"],
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          In Relevant Records
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {words.relevant.map((word) => (
            <WordTag key={word} word={word} color="tertiary.main" />
          ))}
        </Stack>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          In Not Relevant Records
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {words.irrelevant.map((word) => (
            <WordTag key={word} word={word} color="grey.600" />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

const WordCounts = () => {
  const { project_id } = useParams();
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);

  const { data, isLoading } = useQuery(
    ["fetchWordCounts", { project_id }],
    ProjectAPI.fetchWordCounts,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Card sx={{ bgcolor: "transparent" }}>
      <CardContent sx={{ mt: 4, position: "relative" }}>
        <Box sx={{ position: "absolute", top: -32, right: 8 }}>
          <IconButton
            size="small"
            onClick={(e) => setAnchorElInfo(e.currentTarget)}
          >
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>
        {isLoading ? (
          <Stack spacing={3}>
            {[...Array(2)].map((_, index) => (
              <Box key={index}>
                <Skeleton width={140} height={24} sx={{ mb: 1 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[...Array(6)].map((_, chipIndex) => (
                    <Skeleton
                      key={chipIndex}
                      variant="rounded"
                      width={70}
                      height={36}
                      sx={{ borderRadius: 1.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                In Relevant Records
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {data?.relevant ? (
                  data?.relevant
                    .slice(0, 12)
                    .map((word) => (
                      <WordTag key={word} word={word} color="tertiary.dark" />
                    ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No words available yet
                  </Typography>
                )}
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                In Not Relevant Records
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {data?.irrelevant ? (
                  data?.irrelevant
                    .slice(0, 8)
                    .map((word) => (
                      <WordTag key={word} word={word} color="grey.600" />
                    ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No words available yet
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        )}

        <Popover
          open={Boolean(anchorElInfo)}
          anchorEl={anchorElInfo}
          onClose={() => setAnchorElInfo(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: { borderRadius: 2, maxWidth: 320 },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Common Words
                </Typography>
                <Typography variant="body2" align="justify">
                  The are the frequently occurring words in your relevant and
                  not relevant records.
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Interpretation Guide
                </Typography>
                <Typography variant="body2" align="justify">
                  Use these patterns to validate if the model is learning from
                  your decisions. {""}
                  <strong>However,</strong> {""} while they can indicate
                  relevant topics, remember that words may appear in both
                  categories and their meaning depends on the specific context
                  of your review.
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Example
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 2, textAlign: "justify" }}
                >
                  In a medical systematic review, you might see patterns like
                  this:
                </Typography>
                <WordExample />
              </Box>
              <Button
                href="https://asreview.readthedocs.io"
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
      </CardContent>
    </Card>
  );
};

export default WordCounts;

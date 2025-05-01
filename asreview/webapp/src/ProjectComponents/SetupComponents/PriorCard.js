import React, { useContext } from "react";
import { useQuery, useQueryClient } from "react-query";

import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import SearchIcon from "@mui/icons-material/Search";
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
import Grid from "@mui/material/Grid2";
import { LabelHistoryPrior } from "ProjectComponents/HistoryComponents";
import { LoadingCardHeader } from "StyledComponents/LoadingCardheader";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { projectModes } from "globals.js";
import { useToggle } from "hooks/useToggle";
import { AddPriorKnowledge } from "./SearchComponents";

const PriorCard = ({ editable = true, mode = projectModes.ORACLE }) => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const [openPriorSearch, setOpenPriorSearch] = React.useState(false);
  const [openPriorView, toggleOpenPriorView] = useToggle(false);
  // const [priorType, setPriorType] = React.useState("records");
  const priorType = "records";

  const { data, isLoading } = useQuery(
    ["fetchLabeledStats", { project_id: project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      refetchOnWindowFocus: false,
    },
  );

  const onClosePriorSearch = () => {
    queryClient.resetQueries("fetchLabeledStats");
    setOpenPriorSearch(false);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ position: "relative" }}>
      <LoadingCardHeader
        title="Prior knowledge"
        subheader="Prior knowledge helps to warm up and accelerate the AI"
        isLoading={isLoading}
      />

      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <IconButton size="small" onClick={handlePopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
      </Box>

      {/* <CardContent>
        <FormControl>
          <FormLabel id="prior-type-radio">
            What knowledge so you want the AI to use in the beginning?
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="prior-type-radio"
            name="prior-type"
            defaultValue={priorType}
            onChange={(event) => setPriorType(event.target.value)}
          >
            <FormControlLabel
              value="records"
              control={<Radio />}
              label="Records"
            />
            <FormControlLabel
              value="criteria"
              control={<Radio />}
              label="Review criteria"
            />
            <FormControlLabel
              value="file"
              control={<Radio />}
              label="From file"
            />
          </RadioGroup>
        </FormControl>
      </CardContent> */}

      {priorType === "records" && (
        <>
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rectangular" height={56} />
            ) : (
              <>
                {(data?.n_prior_inclusions === 0 ||
                  data?.n_prior_exclusions === 0) && (
                  <Typography>
                    Search for one or more relevant records and label them
                    relevant. It's also possible to label irrelevant records.
                  </Typography>
                )}
                {data?.n_prior_inclusions !== 0 &&
                  data?.n_prior_exclusions !== 0 && (
                    <Typography>
                      You added{" "}
                      {`${data?.n_prior_inclusions} relevant records and ${data?.n_prior_exclusions} records that aren't relevant.`}
                    </Typography>
                  )}
              </>
            )}
          </CardContent>
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rectangular" width={100} height={36} />
            ) : (
              <>
                <Button
                  id={"add-prior-search"}
                  onClick={() => setOpenPriorSearch(true)}
                  variant="contained"
                  disabled={!editable}
                  sx={{ mr: 2 }}
                >
                  Search
                </Button>

                <Button
                  id={"add-prior-view"}
                  onClick={toggleOpenPriorView}
                  disabled={
                    data?.n_prior_inclusions === 0 &&
                    data?.n_prior_exclusions === 0
                  }
                >
                  {openPriorView
                    ? "Hide records"
                    : "Show records (" + data?.n_prior + ")"}
                </Button>
              </>
            )}
          </CardContent>
        </>
      )}
      {priorType === "records" && openPriorView && (
        <>
          <Divider />
          <CardContent>
            <LabelHistoryPrior
              project_id={project_id}
              mode={mode}
              n_prior_inclusions={data && data?.n_prior_inclusions}
              n_prior_exclusions={data && data?.n_prior_exclusions}
            />
          </CardContent>
        </>
      )}

      {/* {(priorType === "criteria" || priorType === "file") && (
        <CardContent>
          <Alert severity="info">
            Coming soon! Keep an eye on our website and socials.
          </Alert>
        </CardContent>
      )} */}

      <AddPriorKnowledge open={openPriorSearch} onClose={onClosePriorSearch} />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 350,
          },
        }}
      >
        <Box
          sx={(theme) => ({
            p: 3,
            maxHeight: "80vh",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: (theme) => theme.palette.grey[300],
              borderRadius: "4px",
              "&:hover": {
                background: (theme) => theme.palette.grey[400],
              },
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
              borderRadius: "4px",
            },
            scrollbarWidth: "thin",
            scrollbarColor: (theme) => `${theme.palette.grey[300]} transparent`,
          })}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Prior Knowledge Explained
              </Typography>
              <Typography variant="body2" align="justify">
                Prior knowledge helps the AI understand your research criteria
                from the start, making the learning process more efficient.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                How to Add Prior Knowledge
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "background.paper"
                          : "transparent",
                    })}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SearchIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="subtitle2">
                          Search & Label
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Search for known relevant papers and label them to train
                        the AI
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid xs={6}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "background.paper"
                          : "transparent",
                    })}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LibraryAddOutlinedIcon
                          sx={{ color: "text.secondary" }}
                        />
                        <Typography variant="subtitle2">
                          Label relevant
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Mark papers as relevant that match your research
                        criteria
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid xs={6}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "background.paper"
                          : "transparent",
                    })}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <NotInterestedOutlinedIcon
                          sx={{ color: "text.secondary" }}
                        />
                        <Typography variant="subtitle2">
                          Label irrelevant
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Optionally mark papers as not relevant to refine the
                        AI's understanding
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Button
                href="https://asreview.readthedocs.io/en/latest/guides/priorknowledge.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Card>
  );
};

export default PriorCard;

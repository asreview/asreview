import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  IconButton,
  Popover,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { LoadingCardHeader } from "StyledComponents/LoadingCardheader";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const InfoPopover = ({ anchorEl, handlePopoverClose }) => {
  return (
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
            background: theme.palette.grey[300],
            borderRadius: "4px",
            "&:hover": {
              background: theme.palette.grey[400],
            },
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "4px",
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${theme.palette.grey[300]} transparent`,
        })}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Screening Options
            </Typography>
            <Typography variant="body2" align="justify">
              Configure how records are presented during the screening process.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Hide DOI and URL links
            </Typography>
            <Typography variant="body2" color="text.secondary" align="justify">
              When enabled, the DOI and URL buttons are hidden from the
              screening interface. This prevents reviewers from accessing the
              full text of a record, which is useful for validation studies
              where screening decisions should be based solely on the title and
              abstract.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
};

const ScreeningCard = () => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { data, isLoading } = useQuery(
    ["fetchProject", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  const { mutate } = useMutation(ProjectAPI.mutateInfo, {
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchProject", { project_id }]);
    },
  });

  const hideLinks = data?.hide_links ?? false;

  return (
    <Card>
      <LoadingCardHeader
        title="Screening"
        subheader="Configure the screening interface"
        isLoading={isLoading}
        action={
          <IconButton
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
          >
            <StyledLightBulb />
          </IconButton>
        }
      />

      <InfoPopover
        anchorEl={anchorEl}
        handlePopoverClose={() => {
          setAnchorEl(null);
        }}
      />

      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={hideLinks}
              onChange={(e) => {
                mutate({
                  project_id: project_id,
                  hide_links: e.target.checked,
                });
              }}
            />
          }
          label="Hide DOI and URL links during screening"
        />
      </CardContent>
    </Card>
  );
};

export default ScreeningCard;

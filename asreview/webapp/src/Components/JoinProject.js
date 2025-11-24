import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  Stack,
} from "@mui/material";
import { Groups, PersonOutline } from "@mui/icons-material";
import { useMutation, useQuery } from "react-query";
import { TeamAPI } from "api";
import { useAuth } from "hooks/useAuth";

const JoinProject = () => {
  const { encoded_token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Fetch project preview info
  const {
    data: previewData,
    isLoading: previewLoading,
    error: previewError,
  } = useQuery(
    ["previewInvitation", encoded_token],
    () => TeamAPI.previewInvitation(encoded_token),
    {
      enabled: isAuthenticated && !isLoading,
      retry: false,
    },
  );

  const joinMutation = useMutation(() => TeamAPI.joinProject(encoded_token), {
    onSuccess: (response) => {
      // Navigate directly to the project
      const projectId = response.data.project_id;
      if (projectId) {
        navigate(`/reviews/${projectId}`);
      }
    },
    onError: (error) => {
      // Error handling happens in the UI
    },
  });

  React.useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      const returnUrl = `/join/${encoded_token}`;
      navigate(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isLoading, isAuthenticated, encoded_token, navigate]);

  React.useEffect(() => {
    // If user is already owner or member, navigate directly to project
    const projectInfo = previewData?.data;
    if (
      projectInfo?.project_id &&
      (projectInfo.is_owner || projectInfo.is_member)
    ) {
      navigate(`/reviews/${projectInfo.project_id}`);
    }
  }, [previewData, navigate]);

  const handleJoinProject = () => {
    joinMutation.mutate();
  };

  const projectInfo = previewData?.data;

  // Show loading while checking authentication or fetching preview
  if (isLoading || previewLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Handle preview error
  if (previewError) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            py: 4,
          }}
        >
          <Card sx={{ width: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {previewError.response?.data?.message ||
                  "Invalid or expired invitation link."}
              </Alert>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate("/reviews")}
              >
                Go to Projects
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  // If user is already owner or member, show loading while redirecting
  if (projectInfo?.is_owner || projectInfo?.is_member) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Card sx={{ width: "100%" }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Groups sx={{ fontSize: 64, color: "primary.main" }} />
            </Box>
            <Typography variant="h5" align="center" gutterBottom>
              Join Project Team
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              sx={{ mb: 1 }}
            >
              You've been invited to collaborate on the following project. Click
              "Join Project" below to accept the invitation.
            </Typography>

            {projectInfo && (
              <Stack spacing={2} sx={{ mt: 3, mb: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "action.hover",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Project
                  </Typography>
                  <Typography variant="h6">
                    {projectInfo.project_name}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "action.hover",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PersonOutline fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Owner
                    </Typography>
                    <Typography variant="body1">
                      {projectInfo.owner_name}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            )}

            {joinMutation.isError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {joinMutation.error?.response?.data?.message ||
                  "Failed to join project. Please try again."}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleJoinProject}
              disabled={joinMutation.isLoading}
              startIcon={
                joinMutation.isLoading ? <CircularProgress size={20} /> : null
              }
            >
              {joinMutation.isLoading ? "Joining..." : "Join Project"}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default JoinProject;

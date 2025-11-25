import {
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Box,
} from "@mui/material";
import {
  ContentCopy,
  Link as LinkIcon,
  Download,
  LinkOff,
} from "@mui/icons-material";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import QRCode from "react-qr-code";
import { TeamAPI } from "api";

const InvitationLink = ({ project_id, variant = "card" }) => {
  const [copySuccess, setCopySuccess] = React.useState(false);
  const qrCodeRef = React.useRef(null);
  const queryClient = useQueryClient();

  // Fetch existing invitation link
  const { data: linkData } = useQuery(
    ["fetchInvitationLink", project_id],
    TeamAPI.fetchInvitationLink,
    {
      refetchOnWindowFocus: false,
    },
  );

  // Construct full URL from encoded token
  const invitationLink = linkData?.encoded_token
    ? `${window.location.origin}/join/${linkData.encoded_token}`
    : null;

  const { mutate: generateLink, isLoading } = useMutation(
    () => TeamAPI.generateInvitationLink(project_id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchInvitationLink", project_id]);
      },
      onError: (error) => {
        console.error("Failed to generate invitation link:", error);
      },
    },
  );

  const { mutate: revokeLink, isLoading: isRevoking } = useMutation(
    () => TeamAPI.revokeInvitationLink(project_id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchInvitationLink", project_id]);
      },
      onError: (error) => {
        console.error("Failed to revoke invitation link:", error);
      },
    },
  );

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector("svg");
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 300;
      canvas.height = 300;

      img.onload = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `invitation-qr-${project_id}.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const content = (
    <Stack spacing={2}>
      {!invitationLink ? (
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <LinkIcon />}
          onClick={() => generateLink()}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Invitation Link"}
        </Button>
      ) : (
        <>
          <TextField
            fullWidth
            value={invitationLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopyLink} edge="end">
                    <ContentCopy />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            label="Invitation Link"
          />
          {copySuccess && (
            <Alert severity="success">Link copied to clipboard!</Alert>
          )}
          <Box
            ref={qrCodeRef}
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: 2,
              backgroundColor: "white",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <QRCode value={invitationLink} size={300} />
          </Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownloadQR}
            fullWidth
          >
            Download QR Code
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={() => generateLink()}
              fullWidth
            >
              Regenerate Link
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={
                isRevoking ? <CircularProgress size={20} /> : <LinkOff />
              }
              onClick={() => revokeLink()}
              disabled={isRevoking}
              fullWidth
            >
              {isRevoking ? "Revoking..." : "Revoke Link"}
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Card>
      <CardHeader
        title="Invite team members"
        subheader="Send this link or show this QR code to the people you want to add to your project team."
      />
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default InvitationLink;

import React, { useState } from "react";
import { connect } from "react-redux";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  ListItem,
  Snackbar,
  useTheme,
  Tooltip,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Close } from "@mui/icons-material";
import { StyledTextButton } from "StyledComponents/StyledButton";
import { StyledIconButton } from "StyledComponents/StyledButton";
import { styled } from "@mui/material/styles";

const PREFIX = "CiteDialog";

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

const CitationStylesRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  overflowX: "auto",
  [theme.breakpoints.up("sm")]: {
    flexDirection: "column",
  },
}));

const CiteDialog = ({ isOpen, onClose, mobileScreen, asreview_version }) => {
  const theme = useTheme();
  const copyButtonSize = theme.spacing(6);
  const [selectedCitationStyle, setSelectedStyle] = useState("RIS");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const copyToClipboard = (citationText) => {
    navigator.clipboard.writeText(citationText).then(() => {
      setSnackbarOpen(true);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleStyleClick = (style) => {
    setSelectedStyle(style);
  };

  const citationStyles = {
    RIS: [
      `TY  - COMP`,
      `AU  - ASReview LAB developers`,
      `PY  - 2023`,
      `TI  - ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]`,
      `PB  - Zenodo`,
      `UR  - https://doi.org/10.5281/zenodo.3345592`,
      `DO  - 10.5281/ZENODO.10084260`,
      `ER  - `,
    ],
    APA: [
      `ASReview LAB developers. (2023). ASReview LAB: A tool for AI-assisted systematic reviews [Software v.${asreview_version}]. Zenodo. https://doi.org/10.5281/zenodo.3345592`,
    ],
    MLA: [
      `ASReview LAB developers. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]." Zenodo, 2023, https://doi.org/10.5281/zenodo.3345592.`,
    ],
    BibTex: [
      `@software{asreviewlab2023,`,
      `title={ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]},`,
      `author={ASReview LAB developers},`,
      `year={2023},`,
      `url={https://doi.org/10.5281/zenodo.3345592},`,
      `note={Software version: ${asreview_version}}`,
      `}`,
    ],
    Chicago: [
      `ASReview LAB developers. 2023. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]." Zenodo. https://doi.org/10.5281/zenodo.3345592.`,
    ],
    Vancouver: [
      `ASReview LAB developers. ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]. Zenodo; 2023. Available from: https://doi.org/10.5281/zenodo.3345592`,
    ],
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md">
      {!mobileScreen && (
        <Stack className="dialog-header" direction="row" spacing={1}>
          <DialogTitle>Cite ASReview LAB</DialogTitle>
          <Tooltip title="Close">
            <StyledIconButton
              className="dialog-header-button right"
              onClick={onClose}
            >
              <Close />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      )}
      <Divider />
      <StyledDialogContent className={`${PREFIX}-content`}>
        <CitationStylesRow>
          {Object.keys(citationStyles).map((citationStyle) => (
            <ListItem
              key={citationStyle}
              onClick={() => handleStyleClick(citationStyle)}
              selected={citationStyle === selectedCitationStyle}
            >
              <StyledTextButton>{citationStyle}</StyledTextButton>
            </ListItem>
          ))}
        </CitationStylesRow>
        <Divider
          orientation={mobileScreen ? "horizontal" : "vertical"}
          flexItem
        />

        <Box
          sx={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            padding: theme.spacing(2),
            backgroundColor: theme.palette.grey[200],
          }}
        >
          <Box sx={{ overflow: "auto" }}>
            {citationStyles[selectedCitationStyle].map((line, index) => (
              <Typography
                key={index}
                sx={{
                  paddingRight: copyButtonSize,
                }}
              >
                {line}
              </Typography>
            ))}
          </Box>

          <IconButton
            onClick={() =>
              copyToClipboard(citationStyles[selectedCitationStyle])
            }
            sx={{
              position: "absolute",
              right: theme.spacing(1),
              top: theme.spacing(1),
            }}
          >
            <ContentCopyIcon />
          </IconButton>
        </Box>
      </StyledDialogContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Citation copied to clipboard"
      />
    </Dialog>
  );
};

export default CiteDialog;

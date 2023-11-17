import React, { useState } from "react";
import { connect } from "react-redux";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { StyledTextButton } from "../StyledComponents/StyledButton.js";
import { styled } from "@mui/material/styles";

const PREFIX = "CiteDialog";

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.action.selected : "transparent",
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  padding: theme.spacing(0.5),
}));

const CitationStylesRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  overflowX: "auto",
  padding: theme.spacing(1),
  "& > *": {
    marginRight: theme.spacing(1),
  },
  [theme.breakpoints.up("sm")]: {
    flexDirection: "column",
  },
}));

const mapStateToProps = (state) => {
  return {
    asreview_version: state.asreview_version,
  };
};

const CiteDialog = ({ isOpen, onClose, mobileScreen, asreview_version }) => {
  const theme = useTheme();
  const copyButtonSize = theme.spacing(6);
  const [selectedStyle, setSelectedStyle] = useState("RIS");
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
    ].join("\n"),
    APA: [
      `ASReview LAB developers. (2023). ASReview LAB: A tool for AI-assisted systematic reviews [Software v.${asreview_version}]. Zenodo. https://doi.org/10.5281/zenodo.3345592`,
    ].join("\n"),
    MLA: [
      `ASReview LAB developers. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]." Zenodo, 2023, https://doi.org/10.5281/zenodo.3345592.`,
    ].join("\n"),
    BibTex: [
      `@software{asreviewlab2023,`,
      `title={ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]},`,
      `author={ASReview LAB developers},`,
      `year={2023},`,
      `url={https://doi.org/10.5281/zenodo.3345592},`,
      `note={Software version: ${asreview_version}}`,
      `}`,
    ].join("\n"),
    Chicago: [
      `ASReview LAB developers. 2023. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]." Zenodo. https://doi.org/10.5281/zenodo.3345592.`,
    ].join("\n"),
    Vancouver: [
      `ASReview LAB developers. ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${asreview_version}]. Zenodo; 2023. Available from: https://doi.org/10.5281/zenodo.3345592`,
    ].join("\n"),
  };

  const renderCitationText = (style) => {
    return citationStyles[style].split("\n").map((line, index) => (
      <ListItem key={index} sx={{ padding: 0, display: "block" }}>
        <ListItemText
          primary={line}
          primaryTypographyProps={{
            variant: "caption",
            sx: {
              padding: 0,
              display: "block",
              whiteSpace: "pre-line",

              textOverflow: "ellipsis",
              paddingRight: copyButtonSize,
            },
          }}
        />
      </ListItem>
    ));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={mobileScreen}
    >
      {!mobileScreen && <DialogTitle>Citation Styles</DialogTitle>}
      <Divider />
      <StyledDialogContent className={`${PREFIX}-content`}>
        <CitationStylesRow>
          {Object.keys(citationStyles).map((style) => (
            <StyledListItem
              key={style}
              button
              onClick={() => handleStyleClick(style)}
              selected={style === selectedStyle}
            >
              <StyledTextButton>{style}</StyledTextButton>
            </StyledListItem>
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
            padding: theme.spacing(1),
            backgroundColor: theme.palette.grey[200],
            borderRadius: theme.shape.borderRadius,
          }}
        >
          <List sx={{ overflow: "auto" }}>
            {renderCitationText(selectedStyle)}
          </List>

          <IconButton
            size="small"
            onClick={() => copyToClipboard(citationStyles[selectedStyle])}
            sx={{
              position: "absolute",
              right: theme.spacing(1),
              top: theme.spacing(1),
            }}
          >
            <ContentCopyIcon fontSize="small" />
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

export default connect(mapStateToProps)(CiteDialog);

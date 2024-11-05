import { useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";

const citationStyles = {
  ris: [
    `TY  - COMP`,
    `AU  - ASReview LAB developers`,
    `PY  - 2023`,
    `TI  - ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${window.asreviewVersion}]`,
    `PB  - Zenodo`,
    `UR  - https://doi.org/10.5281/zenodo.3345592`,
    `DO  - 10.5281/ZENODO.10084260`,
    `ER  - `,
  ],
  apa: [
    `ASReview LAB developers. (2023). ASReview LAB: A tool for AI-assisted systematic reviews [Software v.${window.asreviewVersion}]. Zenodo. https://doi.org/10.5281/zenodo.3345592`,
  ],
  mla: [
    `ASReview LAB developers. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${window.asreviewVersion}]." Zenodo, 2023, https://doi.org/10.5281/zenodo.3345592.`,
  ],
  bib: [
    `@software{asreviewlab2023,`,
    `title={ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${window.asreviewVersion}]},`,
    `author={ASReview LAB developers},`,
    `year={2023},`,
    `url={https://doi.org/10.5281/zenodo.3345592},`,
    `note={Software version: ${window.asreviewVersion}}`,
    `}`,
  ],
  chicago: [
    `ASReview LAB developers. 2023. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${window.asreviewVersion}]." Zenodo. https://doi.org/10.5281/zenodo.3345592.`,
  ],
  vancouver: [
    `ASReview LAB developers. ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Software v.${window.asreviewVersion}]. Zenodo; 2023. Available from: https://doi.org/10.5281/zenodo.3345592`,
  ],
};

const CiteDialog = ({ open, onClose, citeStyle = "apa" }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(citationStyles[citeStyle]).then(() => {
      setSnackbarOpen(true);
      onClose();
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md">
        <DialogTitle>Cite ASReview LAB</DialogTitle>
        <Divider />
        <DialogContent sx={{ overflow: "auto" }}>
          {citeStyle &&
            citationStyles[citeStyle].map((line, index) => (
              <Typography key={index}>{line}</Typography>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={copyToClipboard}>Copy</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbarOpen(false);
        }}
        message="Citation copied to clipboard"
      />
    </>
  );
};

export default CiteDialog;

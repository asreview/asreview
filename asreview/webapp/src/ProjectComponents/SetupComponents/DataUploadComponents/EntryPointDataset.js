import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useToggle } from "hooks/useToggle";
import React from "react";

const DOILink = (doi) => {
  if (doi !== undefined && doi.startsWith("http")) {
    return doi;
  } else {
    return "https://doi.org/" + doi;
  }
};

const formatCitation = (authors, year) => {
  if (Array.isArray(authors)) {
    var first_author = authors[0].split(",")[0];
    return first_author + " et al. (" + year + ")";
  } else {
    return authors + " (" + year + ")";
  }
};

const EntryPointDataset = ({
  addFile,
  dataset,
  dataset_id,
  isAddingDataset,
}) => {
  const [open, toggleOpen] = useToggle(false);

  const handleAdd = () => {
    if (!isAddingDataset) {
      addFile(dataset_id);
    }
  };

  return (
    <>
      <Card onClick={toggleOpen} elevation={0}>
        <CardMedia
          component="img"
          height="180px"
          image={
            "https://github.com/asreview/asreview-artwork/raw/master/AI_generated/PNG/elas_drugs.png"
          }
          alt={dataset.title}
        />
        <CardContent>
          <Typography>
            {formatCitation(dataset.authors, dataset.year)}
          </Typography>
          {dataset.topic && (
            <Chip label={dataset.topic} color="secondary" sx={{ mt: 1 }} />
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onClose={toggleOpen}>
        <DialogTitle>{dataset.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            {dataset.reference && (
              <Typography>
                Publication:{" "}
                <Link
                  href={
                    dataset.reference &&
                    DOILink(
                      dataset.reference.replace(/^(https:\/\/doi\.org\/)/, ""),
                    )
                  }
                  underline="none"
                  target="_blank"
                  rel="noreferrer"
                >
                  {dataset.reference &&
                    dataset.reference.replace(/^(https:\/\/doi\.org\/)/, "")}
                </Link>
              </Typography>
            )}
            <Typography>
              Dataset:{" "}
              <Link
                href={dataset.link}
                underline="none"
                target="_blank"
                rel="noreferrer"
              >
                {dataset.link}
              </Link>
            </Typography>
            <Typography>
              License:{" "}
              <Link
                href={dataset.link}
                underline="none"
                target="_blank"
                rel="noreferrer"
              >
                {dataset.license}
              </Link>
            </Typography>
          </Stack>
          {dataset.topic && <Chip label={dataset.topic} color="primary" />}
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOpen}>Close</Button>
          <Button onClick={handleAdd} disabled={isAddingDataset}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EntryPointDataset;

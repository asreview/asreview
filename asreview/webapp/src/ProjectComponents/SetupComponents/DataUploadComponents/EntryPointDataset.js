import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme, useMediaQuery } from "@mui/material";

const DOILink = (doi) => {
  if (doi !== undefined && doi.startsWith("http")) {
    return doi;
  } else {
    return "https://doi.org/" + doi;
  }
};

const EntryPointDataset = ({
  addFile,
  dataset,
  dataset_id,
  subset,
  isAddingDataset,
  isAddingDatasetError,
  reset,
}) => {
  const theme = useTheme();
  const mobileScreen = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });

  const [expanded, setExpanded] = React.useState(false);

  const handleAccordion = (dataset_id) => (event, isExpanded) => {
    if (!isAddingDataset) {
      setExpanded(isExpanded ? dataset_id : false);
    }
  };

  const handleAdd = () => {
    if (isAddingDatasetError) {
      reset();
    }
    if (!isAddingDataset) {
      addFile(dataset_id);
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

  return (
    <Accordion
      elevation={3}
      expanded={expanded === dataset_id}
      onChange={handleAccordion(dataset_id)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack
          direction={!mobileScreen ? "row" : "column"}
          sx={{ width: "100%" }}
        >
          <Typography
            sx={{ width: !mobileScreen ? "33%" : "100%", flexShrink: 0 }}
          >
            {formatCitation(dataset.authors, dataset.year)}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {subset === "plugin" ? dataset.description : dataset.topic}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          <Typography>{dataset.title}</Typography>
          {dataset.reference && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
      </AccordionDetails>
      <AccordionActions>
        <LoadingButton loading={isAddingDataset} onClick={handleAdd}>
          Add
        </LoadingButton>
      </AccordionActions>
    </Accordion>
  );
};

export default EntryPointDataset;

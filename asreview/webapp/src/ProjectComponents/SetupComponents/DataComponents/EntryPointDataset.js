import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  Button,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, ExpandMore } from "@mui/icons-material";

const DOILink = (doi) => {
  if (doi !== undefined && doi.startsWith("http")) {
    return doi;
  } else {
    return "https://doi.org/" + doi;
  }
};

const EntryPointDataset = (props) => {
  const handleAccordion = (index, featured) => (event, isExpanded) => {
    if (!props.isAddingDataset) {
      if (featured) {
        props.setExpanded((s) => {
          return {
            other: false,
            featured: isExpanded ? index : false,
          };
        });
      } else {
        props.setExpanded((s) => {
          return {
            other: isExpanded ? index : false,
            featured: false,
          };
        });
      }
    }
  };

  const handleBenchmark = () => {
    if (props.isAddDatasetError) {
      props.reset();
    }
    if (!props.isAddingDataset) {
      props.setExpanded({
        other: false,
        featured: false,
      });
      props.setSelectedDatasetId(props.dataset_id);
    }
  };

  const returnSelected = () => {
    return props.selectedDatasetId === props.dataset_id;
  };

  const returnCheckedIcon = () => {
    if (
      props.selectedDatasetId === props.dataset_id &&
      props.expanded !== props.index
    ) {
      return <CheckCircleOutline color="primary" />;
    } else {
      return <ExpandMore />;
    }
  };

  return (
    <Accordion
      elevation={3}
      expanded={props.expanded === props.index}
      onChange={handleAccordion(props.index, props.featured)}
    >
      <AccordionSummary expandIcon={returnCheckedIcon()}>
        <Typography sx={{ width: "33%", flexShrink: 0 }}>
          {props.authors}
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          {props.description}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          <Typography>{props.title}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            DOI:{" "}
            <Link
              href={props.doi && DOILink(props.doi)}
              underline="none"
              target="_blank"
              rel="noreferrer"
            >
              {props.doi}
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            License:{" "}
            <Link
              href={props.link}
              underline="none"
              target="_blank"
              rel="noreferrer"
            >
              {props.license}
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Location:{" "}
            <Link
              href={props.location}
              underline="none"
              target="_blank"
              rel="noreferrer"
            >
              Link to the dataset
            </Link>
          </Typography>
        </Stack>
      </AccordionDetails>
      <AccordionActions>
        <Button
          disabled={props.isAddingDataset || returnSelected()}
          onClick={handleBenchmark}
        >
          {returnSelected() ? "Selected" : "Select"}
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

export default EntryPointDataset;

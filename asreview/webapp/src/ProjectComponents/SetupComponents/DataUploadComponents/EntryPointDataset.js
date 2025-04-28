import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
  LinearProgress,
} from "@mui/material";
import {
  DeveloperBoardOutlined,
  MedicalServicesOutlined,
  PsychologyAltOutlined,
  EmojiNatureOutlined,
} from "@mui/icons-material";
import { useToggle } from "hooks/useToggle";

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

const getColor = (topic) => {
  switch (topic) {
    case "Psychology":
      return "secondary.main";
    case "Medicine":
      return "tertiary.main";
    case "Computer science":
      return "#8BAAFF";
    case "Biology":
      return "#9B6E96";
    default:
      return "grey.500";
  }
};

const CardIcon = ({ iconName }) => {
  const iconProps = {
    fontSize: "medium",
    sx: { m: 1, color: "black" },
  };

  let iconType;

  switch (iconName) {
    case "Psychology":
      iconType = <PsychologyAltOutlined {...iconProps} />;
      break;
    case "Medicine":
      iconType = <MedicalServicesOutlined {...iconProps} />;
      break;
    case "Computer science":
      iconType = <DeveloperBoardOutlined {...iconProps} />;
      break;
    case "Biology":
      iconType = <EmojiNatureOutlined {...iconProps} />;
      break;
    default:
      iconType = null;
  }

  return (
    <Box
      sx={{
        bgcolor: getColor(iconName),
        p: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {iconType}
    </Box>
  );
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
      <Card onClick={toggleOpen} elevation={0} sx={{ height: "100%" }}>
        <CardActionArea sx={{ height: "100%" }}>
          <Stack direction="row" spacing={1} sx={{ height: "100%" }}>
            <CardIcon iconName={dataset.topic} />
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Typography>
                {formatCitation(dataset.authors, dataset.year)}
              </Typography>
            </CardContent>
          </Stack>
        </CardActionArea>
      </Card>
      <Dialog open={open} onClose={toggleOpen}>
        <DialogTitle>
          {dataset.title}{" "}
          {dataset.topic && (
            <Chip
              label={dataset.topic}
              sx={{ bgcolor: getColor(dataset.topic) }}
            />
          )}
        </DialogTitle>
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
            <Typography>Number of records: {dataset.n_records}</Typography>
            <Typography>Number of relevant: {dataset.n_relevant}</Typography>
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

          {isAddingDataset && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Downloading...
              </Typography>
              <Box sx={{ width: "100%", mt: 1 }}>
                <LinearProgress />
              </Box>
            </Box>
          )}
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

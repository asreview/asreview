import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
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

const CardIcon = ({ iconName }) => {
  const iconProps = {
    fontSize: "medium",
    sx: { m: 1 },
  };

  let iconType;
  let iconBGColor;

  switch (iconName) {
    case "Psychology":
      iconType = <PsychologyAltOutlined {...iconProps} />;
      iconBGColor = "secondary.main";
      break;
    case "Medicine":
      iconType = <MedicalServicesOutlined {...iconProps} />;
      iconBGColor = "tertiary.main";
      break;
    case "Computer science":
      iconType = <DeveloperBoardOutlined {...iconProps} />;
      iconBGColor = "#8BAAFF";
      break;
    case "Biology":
      iconType = <EmojiNatureOutlined {...iconProps} />;
      iconBGColor = "#9B6E96";
      break;
    default:
      iconType = null;
      iconBGColor = "grey.500";
  }

  return <Box sx={{ bgcolor: iconBGColor, p: 1 }}>{iconType}</Box>;
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
        <Stack direction="row" spacing={1}>
          <CardIcon iconName={dataset.topic} />
          <CardContent>
            <Typography>
              {formatCitation(dataset.authors, dataset.year)}
            </Typography>
          </CardContent>
        </Stack>
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

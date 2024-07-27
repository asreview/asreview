import {
  Diversity3,
  Email,
  LibraryBooks,
  Payment,
  StarBorder,
} from "@mui/icons-material";
import { Box, Button, Grid, Link, Stack, Typography } from "@mui/material";
import "App.css";
import { CiteDialog } from "Components";
import { useToggle } from "hooks/useToggle";

const InteractionButtons = () => {
  const [citeOpen, toggleCite] = useToggle();

  return (
    <Box>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        Love using ASReview LAB?
      </Typography>

      <Box sx={{ maxWidth: "600px", margin: "auto" }}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={4} md={2} sx={{ textAlign: "center", width: "120px" }}>
            <Button onClick={toggleCite} color="primary">
              <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                <LibraryBooks fontSize="large" sx={{ m: "0.5rem" }} />
                <Typography>Cite</Typography>
              </Stack>
            </Button>
            <CiteDialog
              isOpen={citeOpen}
              onClose={toggleCite}
              asreview_version={window.asreviewVersion}
            />
          </Grid>
          <Grid item xs={4} md={2} sx={{ textAlign: "center", width: "120px" }}>
            <Button
              component={Link}
              target="_blank"
              href="https://github.com/asreview/asreview"
            >
              <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                <StarBorder fontSize="large" sx={{ m: "0.5rem" }} />
                <Typography>Star</Typography>
              </Stack>
            </Button>
          </Grid>
          <Grid item xs={4} md={2} sx={{ textAlign: "center", width: "120px" }}>
            <Button
              component={Link}
              target="_blank"
              href="https://asreview.nl/donate"
            >
              <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                <Payment fontSize="large" sx={{ m: "0.5rem" }} />
                <Typography>Donate</Typography>
              </Stack>
            </Button>
          </Grid>
          <Grid item xs={4} md={2} sx={{ textAlign: "center", width: "120px" }}>
            <Button
              component={Link}
              target="_blank"
              href="https://asreview.ai/newsletter/subscribe"
            >
              <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                <Email fontSize="large" sx={{ m: "0.5rem" }} />
                <Typography>Subscribe</Typography>
              </Stack>
            </Button>
          </Grid>
          <Grid item xs={4} md={2} sx={{ textAlign: "center", width: "120px" }}>
            <Button
              component={Link}
              target="_blank"
              href="https://asreview.nl/community"
            >
              <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                <Diversity3 fontSize="large" sx={{ m: "0.5rem" }} />
                <Typography>Contribute</Typography>
              </Stack>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default InteractionButtons;

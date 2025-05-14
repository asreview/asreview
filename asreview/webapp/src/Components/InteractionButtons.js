import {
  Diversity3Outlined,
  EmailOutlined,
  SchoolOutlined,
  PaymentOutlined,
  StarBorder,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Fade,
  Grid2 as Grid,
  Link,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import "App.css";
import { CiteDialog } from "Components";
import React from "react";

import { donateURL, githubURL, newsletterURL } from "globals.js";

const InteractionButtons = () => {
  const [citeState, setCiteState] = React.useState({
    open: false,
    style: null,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleCiteStyleChange = (style) => {
    setCiteState({ open: true, style });
    setAnchorEl(null);
  };

  const handleCiteDialogClose = () => {
    setCiteState({ open: false, style: citeState.style });
  };

  const resetCiteState = () => {
    setCiteState({ open: citeState.open, style: null });
  };

  const open = Boolean(anchorEl);

  return (
    <Fade in>
      <Box sx={{ p: 6 }}>
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontFamily: "Roboto Serif", mb: 2 }}
        >
          Love using ASReview LAB?
        </Typography>
        <Box sx={{ maxWidth: "600px", margin: "auto" }}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              sx={{ textAlign: "center", width: "100px" }}
              size={{
                xs: 4,
                md: 2,
              }}
            >
              <Button
                onClick={(event) => {
                  setAnchorEl(event.currentTarget);
                }}
                id="cite-button"
                aria-controls={open ? "cite-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                color="inherit"
              >
                <Stack
                  justifyContent="center"
                  sx={{ alignItems: "center", gap: "0.25rem" }}
                >
                  <SchoolOutlined fontSize="medium" />
                  <Typography variant="body2">Cite</Typography>
                </Stack>
              </Button>

              <Menu
                open={open}
                onClose={() => {
                  setAnchorEl(null);
                }}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <MenuItem onClick={() => handleCiteStyleChange("apa")}>
                  APA
                </MenuItem>
                <MenuItem onClick={() => handleCiteStyleChange("bib")}>
                  BibTex
                </MenuItem>
                <MenuItem onClick={() => handleCiteStyleChange("ris")}>
                  RIS
                </MenuItem>
                <MenuItem onClick={() => handleCiteStyleChange("mla")}>
                  MLA
                </MenuItem>
                <MenuItem onClick={() => handleCiteStyleChange("chicago")}>
                  Chicago
                </MenuItem>
                <MenuItem onClick={() => handleCiteStyleChange("vancouver")}>
                  Vancouver
                </MenuItem>
              </Menu>

              <CiteDialog
                open={citeState.open}
                citeStyle={citeState.style}
                onClose={handleCiteDialogClose}
                onExited={resetCiteState}
              />
            </Grid>
            <Grid
              sx={{ textAlign: "center", width: "100px" }}
              size={{
                xs: 4,
                md: 2,
              }}
            >
              <Button
                component={Link}
                target="_blank"
                href={githubURL}
                color="inherit"
              >
                <Stack
                  justifyContent="center"
                  sx={{ alignItems: "center", gap: "0.25rem" }}
                >
                  <StarBorder fontSize="medium" />
                  <Typography variant="body2">Star</Typography>
                </Stack>
              </Button>
            </Grid>
            <Grid
              sx={{ textAlign: "center", width: "100px" }}
              size={{
                xs: 4,
                md: 2,
              }}
            >
              <Button
                component={Link}
                target="_blank"
                href={donateURL}
                color="inherit"
              >
                <Stack
                  justifyContent="center"
                  sx={{ alignItems: "center", gap: "0.25rem" }}
                >
                  <PaymentOutlined fontSize="medium" />
                  <Typography variant="body2">Donate</Typography>
                </Stack>
              </Button>
            </Grid>
            <Grid
              sx={{ textAlign: "center", width: "100px" }}
              size={{
                xs: 4,
                md: 2,
              }}
            >
              <Button
                component={Link}
                target="_blank"
                href={newsletterURL}
                color="inherit"
              >
                <Stack
                  justifyContent="center"
                  sx={{ alignItems: "center", gap: "0.25rem" }}
                >
                  <EmailOutlined fontSize="medium" />
                  <Typography variant="body2">Subscribe</Typography>
                </Stack>
              </Button>
            </Grid>
            <Grid
              sx={{ textAlign: "center", width: "100px" }}
              size={{
                xs: 4,
                md: 2,
              }}
            >
              <Button
                component={Link}
                target="_blank"
                href="https://asreview.nl/community"
                color="inherit"
              >
                <Stack
                  justifyContent="center"
                  sx={{ alignItems: "center", gap: "0.25rem" }}
                >
                  <Diversity3Outlined fontSize="medium" />
                  <Typography variant="body2">Contribute</Typography>
                </Stack>
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Fade>
  );
};

export default InteractionButtons;

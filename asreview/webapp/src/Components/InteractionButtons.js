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

const InteractionButtons = () => {
  const [state, setState] = React.useState({
    citeStyle: null,
    anchorEl: null,
  });

  const setCiteStyle = (citeStyle) => {
    setState({ anchorEl: null, citeStyle });
  };

  const setAnchorEl = (anchorEl) => {
    setState({ ...state, anchorEl });
  };

  const { citeStyle, anchorEl } = state;

  const open = Boolean(anchorEl);

  return (
    <Fade in>
      <Box sx={{ p: 6 }}>
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontFamily: "Roboto Serif" }}
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
                <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                  <SchoolOutlined fontSize="large" sx={{ m: "0.5rem" }} />
                  <Typography>Cite</Typography>
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
                <MenuItem onClick={() => setCiteStyle("apa")}>APA</MenuItem>
                <MenuItem onClick={() => setCiteStyle("bib")}>BibTex</MenuItem>
                <MenuItem onClick={() => setCiteStyle("ris")}>RIS</MenuItem>
                <MenuItem onClick={() => setCiteStyle("mla")}>MLA</MenuItem>
                <MenuItem onClick={() => setCiteStyle("chicago")}>
                  Chicago
                </MenuItem>
                <MenuItem onClick={() => setCiteStyle("vancouver")}>
                  Vancouver
                </MenuItem>
              </Menu>

              <CiteDialog
                open={citeStyle !== null}
                citeStyle={citeStyle}
                onClose={() => setCiteStyle(null)}
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
                href="https://github.com/asreview/asreview"
                color="inherit"
              >
                <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                  <StarBorder fontSize="large" sx={{ m: "0.5rem" }} />
                  <Typography>Star</Typography>
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
                href="https://asreview.nl/donate"
                color="inherit"
              >
                <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                  <PaymentOutlined fontSize="large" sx={{ m: "0.5rem" }} />
                  <Typography>Donate</Typography>
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
                href="https://asreview.ai/newsletter/subscribe"
                color="inherit"
              >
                <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                  <EmailOutlined fontSize="large" sx={{ m: "0.5rem" }} />
                  <Typography>Subscribe</Typography>
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
                <Stack justifyContent="center" sx={{ alignItems: "center" }}>
                  <Diversity3Outlined fontSize="large" sx={{ m: "0.5rem" }} />
                  <Typography>Contribute</Typography>
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

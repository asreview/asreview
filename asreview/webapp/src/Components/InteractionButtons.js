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
      <Box sx={{ py: 3 }}>
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontFamily: "Roboto Serif", mb: 2 }}
        >
          Love using ASReview LAB?
        </Typography>
        <Box sx={{ maxWidth: "600px", margin: "auto", overflowX: "auto" }}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ width: "100%", flexWrap: "nowrap", minWidth: "320px" }}
          >
            <Box
              sx={{
                textAlign: "center",
                width: { xs: "48px", sm: "80px", md: "100px" },
                minWidth: 0,
                flex: "1 1 0",
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.85rem", md: "1rem" },
                    }}
                  >
                    Cite
                  </Typography>
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
            </Box>
            <Box
              sx={{
                textAlign: "center",
                width: { xs: "48px", sm: "80px", md: "100px" },
                minWidth: 0,
                flex: "1 1 0",
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.85rem", md: "1rem" },
                    }}
                  >
                    Star
                  </Typography>
                </Stack>
              </Button>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                width: { xs: "48px", sm: "80px", md: "100px" },
                minWidth: 0,
                flex: "1 1 0",
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.85rem", md: "1rem" },
                    }}
                  >
                    Donate
                  </Typography>
                </Stack>
              </Button>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                width: { xs: "48px", sm: "80px", md: "100px" },
                minWidth: 0,
                flex: "1 1 0",
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.85rem", md: "1rem" },
                    }}
                  >
                    Subscribe
                  </Typography>
                </Stack>
              </Button>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                width: { xs: "48px", sm: "80px", md: "100px" },
                minWidth: 0,
                flex: "1 1 0",
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.85rem", md: "1rem" },
                    }}
                  >
                    Contribute
                  </Typography>
                </Stack>
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Fade>
  );
};

export default InteractionButtons;

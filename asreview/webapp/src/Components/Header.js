import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  ButtonBase,
  IconButton,
  Toolbar,
  Tooltip,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import { ProfilePopper } from "Components";
import { useEffect, useState } from "react";

import { useToggle } from "hooks/useToggle";
import { ElasIcon } from "icons";
import { WordMark } from "icons/WordMark";
import ElasGameDialog from "./ElasGame";

const Header = ({ toggleNavDrawer, menuOpenButton = true }) => {
  const [openGame, toggleGame] = useToggle();
  const [headerActive, setHeaderActive] = useState(false);

  const { pathname } = useLocation();
  const isReviewPath = pathname.endsWith("/review");

  useEffect(() => {
    window.addEventListener("scroll", () =>
      setHeaderActive(window.scrollY > 55),
    );
  });

  return (
    <>
      <AppBar
        color={"inherit"}
        position="fixed"
        square={true}
        elevation={0}
        sx={(theme) => ({
          bgcolor: theme.palette.background.default,
          borderBottom: `1px solid ${headerActive ? theme.palette.divider : theme.palette.background.default}`,

          [theme.breakpoints.up("md")]: {
            zIndex: theme.zIndex.drawer + 1,
            width: `calc(100% - 80px)`,
            ml: `80px`,
          },
        })}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            {menuOpenButton && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleNavDrawer}
                size="large"
              >
                <Menu />
              </IconButton>
            )}
            <ButtonBase
              disableRipple
              sx={{ width: "100px" }}
              component={Link}
              to="/reviews"
            >
              <WordMark />
            </ButtonBase>

            {isReviewPath && (
              <Tooltip title={"Go on adventure with Elas"} placement={"right"}>
                <IconButton onClick={toggleGame}>
                  <ElasIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {window.authentication === true && <ProfilePopper />}
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />

      {/* Game */}
      <ElasGameDialog open={openGame} toggleOpen={toggleGame} />
    </>
  );
};

export default Header;

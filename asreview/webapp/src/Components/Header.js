import { Menu, MenuOpen } from "@mui/icons-material";
import { AppBar, Box, ButtonBase, IconButton, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";

import { ProfilePopper } from "Components";
import { useEffect, useState } from "react";

import { WordMark } from "icons/WordMark";

const Header = ({ toggleNavDrawer, menuOpenButton = true }) => {
  const [headerColor, setHeaderColor] = useState("transparent");

  const listenScrollEvent = () => {
    window.scrollY > 25
      ? setHeaderColor("inherit")
      : setHeaderColor("transparent");
  };

  useEffect(() => {
    window.addEventListener("scroll", listenScrollEvent);
  });

  return (
    <>
      <AppBar
        color={headerColor}
        position="fixed"
        square={true}
        elevation={0}
        sx={(theme) => ({
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
          </Box>
          {window.authentication === true && <ProfilePopper />}
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />
      {/* <Outlet /> */}
    </>
  );
};

export default Header;

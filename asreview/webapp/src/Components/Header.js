import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  ButtonBase,
  IconButton,
  Toolbar,
  Tooltip,
  Avatar,
  AvatarGroup,
  Collapse,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate, useParams } from "react-router-dom";

import { ProfilePopper } from "Components";

import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useToggle } from "hooks/useToggle";
import { ElasIcon } from "icons";
import { WordMark } from "icons/WordMark";
import ElasGameDialog from "./ElasGame";

import ElasFireman from "../images/ElasFireMan.jpg";
import ElasGrad from "../images/ElasGrad.jpg";
import ElasSuperHero from "../images/ElasSuperHero.jpg";

const users = [
  { name: "Jonathan", avatar: ElasFireman },
  { name: "Rens", avatar: ElasGrad },
  { name: "Berke", avatar: ElasSuperHero },
];

const Header = ({ toggleNavDrawer, menuOpenButton = true }) => {
  const [openGame, toggleGame] = useToggle();
  const [expandAvatars, setExpandAvatars] = useToggle(true);
  const navigate = useNavigate();
  const { project_id } = useParams();

  const { pathname } = useLocation();
  const isReviewPath = pathname.endsWith("/reviewer");

  const headerActive = useScrollTrigger({
    threshold: 0,
  });

  const handleAddUser = () => {
    navigate(`/reviews/${project_id}/team`);
  };

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
          borderRadius: 0,

          [theme.breakpoints.up("md")]: {
            zIndex: theme.zIndex.drawer + 1,
            width: `calc(100% - 88px)`,
            ml: `88px`,
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
                  <ElasIcon color={"primary"} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={setExpandAvatars}
              sx={{
                mr: 1,
              }}
            >
              {expandAvatars ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>

            <Collapse in={expandAvatars} orientation="horizontal">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AvatarGroup
                  max={20}
                  sx={{
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      border: 1,
                      borderColor: "background.paper",
                    },
                  }}
                >
                  {users.map((user, index) => (
                    <Tooltip key={index} title={user.name} arrow>
                      <Avatar alt={user.name} src={user.avatar} />
                    </Tooltip>
                  ))}
                </AvatarGroup>

                <Tooltip title="Add team member" arrow>
                  <IconButton
                    onClick={handleAddUser}
                    size="small"
                    sx={{
                      ml: 0.5,
                      "& .MuiSvgIcon-root": {
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Collapse>

            {window.authentication === true && <ProfilePopper />}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />

      {/* Game */}
      <ElasGameDialog open={openGame} toggleOpen={toggleGame} />
    </>
  );
};

export default Header;

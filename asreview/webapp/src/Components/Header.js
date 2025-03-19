import { Menu } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  AppBar,
  AvatarGroup,
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { ProfilePopper } from "Components";
import { TeamAPI } from "api";

import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useToggle } from "hooks/useToggle";
import { ElasIcon } from "icons";
import ElasGameDialog from "./ElasGame";
import { InitialsAvatar } from "StyledComponents/InitialsAvatar";

const Header = ({ toggleNavDrawer, menuOpenButton = true }) => {
  const [openGame, toggleGame] = useToggle();
  const [expandAvatars, setExpandAvatars] = useToggle(true);
  const navigate = useNavigate();
  const { project_id } = useParams();

  const { pathname } = useLocation();
  const isReviewPath = pathname.endsWith("/reviewer");

  const { data } = useQuery(["fetchUsers", project_id], TeamAPI.fetchUsers, {
    refetchOnWindowFocus: false,
    enabled: !!project_id,
  });

  const users =
    project_id && data?.all_users
      ? data.all_users.filter(
          (user) =>
            (data.collaborators || []).includes(user.id) ||
            (data.invitations || []).includes(user.id),
        )
      : [];

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
            <ButtonBase disableRipple sx={{}} component={Link} to="/reviews">
              <Typography
                component="span"
                sx={{ fontFamily: "kanit", fontSize: "120%", mr: 0.3 }}
              >
                ASReview
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontFamily: "kanit",
                  fontSize: "120%",
                  fontWeight: "bold",
                }}
                color="#FFCC00"
              >
                LAB
              </Typography>
            </ButtonBase>
          </Box>

          {window.authentication === true && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {project_id && (
                <>
                  {isReviewPath && (
                    <Tooltip
                      title={"Go on adventure with Elas"}
                      placement={"right"}
                    >
                      <IconButton onClick={toggleGame}>
                        <ElasIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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
                      <AvatarGroup max={5}>
                        {users.map((user, index) => (
                          <Tooltip
                            key={user.id || index}
                            title={user.name || ""}
                            placement="bottom"
                            arrow
                          >
                            <InitialsAvatar name={user.name} />
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
                </>
              )}
              <ProfilePopper />
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />

      {/* Game */}
      <ElasGameDialog open={openGame} toggleOpen={toggleGame} />
    </>
  );
};

export default Header;

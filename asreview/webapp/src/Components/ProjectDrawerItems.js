import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useQuery } from "react-query";
import { Link, NavLink, useParams } from "react-router-dom";

import {
  ArrowBackOutlined,
  AssessmentOutlined,
  AssignmentOutlined,
  LibraryBooksOutlined,
  PeopleAltOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import { ProjectAPI } from "api";
import { ElasGame } from "Components";
import { useToggle } from "hooks/useToggle";
import { DrawerItem } from "StyledComponents/StyledDrawerItem";

import { ElasSign } from "icons/ElasSign";

const ProjectModeMapping = {
  oracle: "Review",
  simulate: "Simulation",
};

const ProjectDrawerItems = ({
  subset,
  projectInfo = true,
  onClick = null,
  showTooltip = false,
}) => {
  const [openGame, toggleGame] = useToggle();
  const { project_id } = useParams();

  const { data } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        flex: "1 1 auto",
      }}
    >
      <DrawerItem
        primary={subset[0].toUpperCase() + subset.slice(1)}
        to={"/" + subset}
        showTooltip={showTooltip}
        onClick={onClick}
        icon={<ArrowBackOutlined />}
        component={Link}
      />
      {data && (
        <>
          <ListItem
            onClick={toggleGame}
            sx={{ maxWidth: "140px", margin: "auto" }}
          >
            <ElasSign status={data?.reviews[0].status} />
          </ListItem>
          <Fade in={projectInfo} unmountOnExit>
            <ListItem>
              <ListItemText
                primary={`Your ${ProjectModeMapping[data?.mode]}`}
                secondary={data?.name}
              />
            </ListItem>
          </Fade>
        </>
      )}

      <Box
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
          flex: "1 1 auto",
        }}
      >
        <DrawerItem
          key={"project-dashboard"}
          to={``}
          primary={"Dashboard"}
          showTooltip={showTooltip}
          onClick={onClick}
          icon={<AssessmentOutlined />}
          component={NavLink}
          end={true}
        />

        {subset === "reviews" && (
          <DrawerItem
            key={"project-review"}
            to={`review`}
            primary={"Review"}
            showTooltip={showTooltip}
            onClick={onClick}
            icon={<AssignmentOutlined />}
            component={NavLink}
          />
        )}
        <DrawerItem
          key={"project-history"}
          to={`collection`}
          primary={"Collection"}
          showTooltip={showTooltip}
          onClick={onClick}
          icon={<LibraryBooksOutlined />}
          component={NavLink}
        />

        {window.authentication && window.allowTeams && (
          <DrawerItem
            key={"project-team"}
            to={`team`}
            primary={"Team"}
            showTooltip={showTooltip}
            onClick={onClick}
            icon={<PeopleAltOutlined />}
            component={NavLink}
          />
        )}

        <DrawerItem
          key={"project-settings"}
          to={`settings`}
          primary={"Settings"}
          showTooltip={showTooltip}
          onClick={onClick}
          icon={<SettingsOutlined />}
          component={NavLink}
        />
      </Box>

      {/* Game */}
      <Dialog
        open={openGame}
        onClose={toggleGame}
        scroll={"paper"}
        fullWidth={true}
        maxWidth={"lg"}
        aria-labelledby="game-dialog-title"
        aria-describedby="game-dialog-description"
      >
        <DialogTitle id="game-dialog-title">Elas Memory Game</DialogTitle>
        <DialogContent>
          <ElasGame />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleGame}>Take me back</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDrawerItems;

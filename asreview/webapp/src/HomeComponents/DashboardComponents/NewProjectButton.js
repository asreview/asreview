import { Add } from "@mui/icons-material";
import { Fab } from "@mui/material";

import { SetupDialog } from "ProjectComponents/SetupComponents";
import { useToggle } from "hooks/useToggle";

const NewProjectButton = ({ mode }) => {
  const [openCreateProject, toggleCreateProject] = useToggle();

  return (
    <>
      <Fab
        id="create-project"
        color="primary"
        onClick={toggleCreateProject}
        variant="extended"
        sx={(theme) => ({
          [theme.breakpoints.down("sm")]: {
            position: "absolute",
            bottom: 24,
            right: 24,
          },
        })}
      >
        <Add sx={{ mr: 1 }} />
        New
      </Fab>
      <SetupDialog
        mode={mode}
        open={openCreateProject}
        onClose={toggleCreateProject}
      />
    </>
  );
};

export default NewProjectButton;

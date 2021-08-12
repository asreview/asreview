import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import { projectModes } from "../globals.js";

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: "100%",
  },
}));

export default function ProjectModeSelect(props) {
  const classes = useStyles();

  // variables for styling the menu
  const inputLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);

  return (
    <div>
      <FormControl
        variant="outlined"
        className={classes.formControl}
        disabled={props.edit}
      >
        <InputLabel ref={inputLabel} id="mode-label">
          Project type
        </InputLabel>
        <Select
          labelId="mode-label"
          id="demo-simple-select-outlined"
          value={props.mode}
          onChange={props.onModeChange}
          labelWidth={labelWidth}
        >
          <MenuItem value={projectModes.ORACLE} component="div">
            <ListItem>
              <ListItemText
                primary="Oracle"
                secondary="Start an interactive AI-aided screening with an unlabeled dataset."
              />
            </ListItem>
          </MenuItem>
          <MenuItem value={projectModes.EXPLORATION} component="div">
            <ListItem>
              <ListItemText
                primary="Exploration"
                secondary="Explore an existing, labeled dataset in an interactive way."
              />
            </ListItem>
          </MenuItem>
          {props.showSimulate && (
            <MenuItem value={projectModes.SIMULATION} component="div">
              <ListItem>
                <ListItemText
                  primary="Simulation"
                  secondary="Simulate the performance of ASReview on a labeled dataset."
                />
              </ListItem>
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
}

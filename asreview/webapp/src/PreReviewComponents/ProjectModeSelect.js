import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: "100%"
  },
}));

export default function ProjectModeSelect() {
  const classes = useStyles();
  const [age, setAge] = React.useState(1);

  const inputLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <div>

      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel ref={inputLabel} id="demo-simple-select-outlined-label">
          Project type
        </InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={age}
          onChange={handleChange}
          labelWidth={labelWidth}
        >
          <MenuItem value={1}>
            <ListItem>
              <ListItemText
                primary="Systematic review"
                secondary="An interactive AI-aided systematic review. Lorum Ipsum"
              />
            </ListItem>
          </MenuItem>
          <MenuItem value={2}>
            <ListItem>
              <ListItemText
                primary="Exploration"
                secondary="Explore an existing, fully labeled dataset in an interactive way."
              />
            </ListItem>
          </MenuItem>
          <MenuItem value={3}>
            <ListItem>
              <ListItemText
                primary="Simulation"
                secondary="Simulate the performance of ASReview on a fully labeled dataset."
              />
            </ListItem>
          </MenuItem>
        </Select>
      </FormControl>

    </div>
  );
}

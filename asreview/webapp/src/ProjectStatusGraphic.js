import React from "react";
import { Grid, Paper, Typography } from "@material-ui/core";
// import BuildIcon from '@material-ui/icons/Build';
// import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
// import ArchiveIcon from '@material-ui/icons/Archive';

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "16px",
    display: "flex",
  },
  icon: {
    // color: "rgba(0, 0, 2, 0.54)",
    // fontSize: "64px",
  },
  number: {
    textAlign: "center",
    margin: "auto",
  },
}));

const ProjectStatusGraphic = (props) => {
  const classes = useStyles();

  // const [statusCount, setStatusCount] = useState({
  //   setup: null,
  //   inReview: null,
  //   finished: null,
  // });

  // useEffect(() => {
  //   if (props.projects["projects"].length) {
  //     props.projects["projects"].map((project) => {

  //     })
  //   }
  // });

  // console.log(props.projects["projects"].length);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.root}>
            <div className={classes.number}>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                3
              </Typography>
              <Typography>Setup</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.root}>
            <div className={classes.number}>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                5
              </Typography>
              <Typography>In Review</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.root}>
            <div className={classes.number}>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                1
              </Typography>
              <Typography>Finished</Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProjectStatusGraphic;

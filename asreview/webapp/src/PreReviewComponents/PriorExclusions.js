import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@material-ui/core'

import {
  PaperCard,
} from '../PreReviewComponents'

import HelpIcon from '@material-ui/icons/Help';


import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  margin: {
    marginTop: 20
  },
  helpertext: {
    color: "#FF0000"
  },
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  loader: {
    width: '100%',
  },
  helptext : {
    padding: "12px 0px",
  },
  clear : {
    clear: "both",
  }
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const PriorExclusions = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    "records": [],
    "loaded": false,
  });

  const [showHelp, setShowHelp] = React.useState(false);

  const onRemove = (id) => {

    var rec = state["records"].filter(function(record, index, arr){ return record["id"] !== id;});

    console.log("Items to classify in step 4: " + state["records"].length)

    setState({
        "records": rec,
        "loaded": true,
      })
  }
  useEffect(() => {

    const getDocument = () => {
      const url = api_url + `project/${props.project_id}/prior_random`;

      return axios.get(url)
      .then((result) => {
        console.log("" + result.data['result'].length + " random items served for review")
        setState({
          "records": result.data['result'],
          "loaded": true,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    }

    getDocument();

  }, [props.project_id]);

  const toggleHelp = () => {
    setShowHelp(a => (!a));
  };

  return (
    <Box>
      <Box style={{clear: "both"}}>
        <Typography style={{display: "inline"}} variant="h5" align="left">
          Are these 5 randomly selected publications relevant?
        </Typography>
        <Typography style={{width: "25px",margin:"3px", float:"right", opacity: 0.5}}  align="right">
        <HelpIcon onClick={toggleHelp}/>
        </Typography>

        {showHelp &&
          <Typography className={classes.helptext}>
            <Box fontStyle="italic">
              The software requires 1-5 irrelevant papers.
            </Box>
          </Typography>
        }
      </Box>

      <Box className={classes.clear}>
        {!state["loaded"] ?
          <Box className={classes.loader}>
            <CircularProgress
              style={{margin: "0 auto"}}
            />
          </Box> :
          state["records"].map((record, index) => {
              return (
                <PaperCard
                  id={record.id}
                  title={record.title}
                  abstract={record.abstract}
                  included={null}
                  onRevertInclude={() => {}}
                  removeButton={false}
                  classify={true}
                  onRemove={onRemove}
                  key={record.id}
                />
              );
            }
          )
        }
      </Box>

      {/*
      <ArticlePanel
        record={record}
        reviewDrawerState={false}
        showAuthors={false}
        slide={true}
      />
      */}

      <Button
        variant="contained"
        color="primary"
        disabled={state["records"].length !== 0 ? true : false }
        onClick={props.handleNext}
        className={classes.button}
      >
        Next
      </Button>
    </Box>
  )
}

export default connect(mapStateToProps)(PriorExclusions);

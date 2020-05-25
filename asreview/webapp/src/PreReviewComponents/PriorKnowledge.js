import React, {useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  Typography,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Toolbar,
  IconButton,
  Paper,
} from '@material-ui/core'

import SearchIcon from '@material-ui/icons/Search';
import HelpIcon from '@material-ui/icons/Help';

import {
  SearchResult,
  PaperCard,
  PriorInclusions,
  PriorExclusions,
} from '../PreReviewComponents'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  paperRoot: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    marginBottom: "32px",
    minHeight: "200px",
  },
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
    marginBottom: '14px',
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
  help :{
    textAlign: "right",
  },
  helptext : {
    padding: "12px 0px",
  }
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};


const labelPriorItem = (project_id, doc_id, label, callbk=null) => {
  const url = api_url + `project/${project_id}/labelitem`;

  let body = new FormData();
  body.set('doc_id', doc_id);
  body.set('label', label);
  body.set('is_prior', 1);

  axios.post(
    url,
    body,
    {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      }
    })
  .then((result) => {
    if (callbk !== null){
      callbk();
    }
  })
  .catch((error) => {
    console.log(error);
  });

}


const PriorKnowledge = (props) => {
  const classes = useStyles();

  const [state, setState] = React.useState(null)

  const [priorStats, setPriorStats] = React.useState({
    "n_exclusions": null,
    "n_inclusions": null,
    "n_prior": null
  })

  const getPriorIncluded = () => {

    const url = api_url + `project/${props.project_id}/prior_stats`;

    axios.get(url)
    .then((result) => {
      console.log(result.data)
      setPriorStats(result.data);
    })
    .catch((error) => {
      console.log("Failed to  load prior information");
    });

  }

  // include the item in the card
  const includeItem = (doc_id) => {
    console.log(`${props.project_id} - add item ${doc_id} to prior inclusions`);
    labelPriorItem(props.project_id, doc_id, 1)
  }

  // exclude the item in the card
  const excludeItem = (doc_id) => {
    console.log(`${props.project_id} - add item ${doc_id} to prior exclusions`);
    labelPriorItem(props.project_id, doc_id, 0)
  }

  // reset the item (for search and revert)
  const resetItem = (doc_id) => {
    console.log(`${props.project_id} - remove item ${doc_id} from prior knowledge`);
    labelPriorItem(props.project_id, doc_id, -1);
    getPriorIncluded();
  }

  const goNext = () => {

    if (priorStats['n_inclusions'] > 0 && priorStats['n_exclusions'] > 0){
      return true
    } else {
      return false
    }
  }

  /* Skeleton to extend later on */
  const changeMethod = (method) => {
    setState(method);
  }

  useEffect(() => {

    getPriorIncluded()

  }, []);

  return (
    <Box style={{clear: "both"}}>
      <Typography style={{display: "inline"}} variant="h5" align="left">
        Select prior knowledge
      </Typography>

      {/* Display the prior info once loaded */}
      {priorStats.n_prior !== null &&
        <Paper>

          <Box>
            <Typography variant="h1">{priorStats["n_inclusions"]}</Typography>
            <Typography variant="subtitle1">Relevant articles</Typography>
          </Box>
          <Box>
            <Typography variant="h1">{priorStats["n_exclusions"]}</Typography>
            <Typography variant="subtitle1">Irrelevant articles</Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            disabled={state === "search"}
            onClick={() => {changeMethod("search")}}
          >
            Search
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={state === "random"}
            onClick={() => {changeMethod("random")}}
          >
            Random
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={state === "file"}
            onClick={() => {changeMethod("file")}}
          >
            From file
          </Button>

        </Paper>
      }

      { state === "search" &&
        <PriorInclusions
          getPriorIncluded={getPriorIncluded}
          includeItem={includeItem}
          resetItem={resetItem}
        />
      }

      { state === "random" &&
         <PriorExclusions
          getPriorIncluded={getPriorIncluded}
          includeItem={includeItem}
          excludeItem={excludeItem}
        />
      }

      />

      <Button
        variant="contained"
        color="primary"
        disabled={!goNext()}
        onClick={props.handleNext}
        className={classes.button}
      >
        Next
      </Button>
    </Box>
  )
}

export default connect(mapStateToProps)(PriorKnowledge);

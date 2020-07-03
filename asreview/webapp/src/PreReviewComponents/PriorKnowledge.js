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
  Paper,
  CardHeader,
  CardContent,
  Divider,
  Avatar,
  Tooltip,
  IconButton,
  Grow,
} from '@material-ui/core'

import SearchIcon from '@material-ui/icons/Search';
import HelpIcon from '@material-ui/icons/Help';
import AssignmentIcon from '@material-ui/icons/Assignment';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';

import { blue, green, orange, brown } from '@material-ui/core/colors';

import {
  SearchResult,
  PaperCard,
  PriorKnowledgeSearch,
  PriorKnowledgeRandom,
  ResultDialog,
} from '../PreReviewComponents'

import {
  Help,
  useHelp,
} from '../PreReviewComponents'

import axios from 'axios'

import {
  api_url,
  mapStateToProps
} from '../globals.js';

import { connect } from "react-redux";

import './ReviewZone.css';


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
  },
  avatar: {
    color: theme.palette.getContrastText(brown[500]),
    backgroundColor: brown[500],
  }
}));

export const labelPriorItem = (project_id, doc_id, label, callbk=null) => {
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

  const [priorDialog, setPriorDialog] = React.useState(false)

  const [priorStats, setPriorStats] = React.useState({
    "n_exclusions": null,
    "n_inclusions": null,
    "n_prior": null
  })
  const [help, openHelp, closeHelp] = useHelp()

  const updatePriorStats = () => {

    const url = api_url + `project/${props.project_id}/prior_stats`;

    axios.get(url)
    .then((result) => {

      setPriorStats(result.data);

    })
    .catch((error) => {
      console.log("Failed to  load prior information");
    });

  }

  const openPriorKnowledge = () => {
    // open resultdialog
    setPriorDialog(true);
  }


  const closePriorKnowledge = () => {
    // open resultdialog
    setPriorDialog(false);
  }

  // include the item in the card
  const includeItem = (doc_id, callbk=null) => {
    console.log(`${props.project_id} - add item ${doc_id} to prior inclusions`);
    labelPriorItem(props.project_id, doc_id, 1, callbk)
  }

  // exclude the item in the card
  const excludeItem = (doc_id, callbk=null) => {
    console.log(`${props.project_id} - add item ${doc_id} to prior exclusions`);
    labelPriorItem(props.project_id, doc_id, 0, callbk)
  }

  // reset the item (for search and revert)
  const resetItem = (doc_id, callbk=null) => {
    console.log(`${props.project_id} - remove item ${doc_id} from prior knowledge`);
    labelPriorItem(props.project_id, doc_id, -1, callbk);
    updatePriorStats();
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

    updatePriorStats()

  }, []);


  useEffect(() => {

    // scroll to bottom
    props.scrollToBottom()

    // enable next button
    if (goNext()){
      props.isReady()
    }

  }, [priorStats]);

  console.log(props.project_id)

  return (
    <Box style={{clear: "both"}}>

      {/* Display the prior info once loaded */}
      {priorStats.n_prior !== null &&

      <Grow
        in={true}
      >
        <Paper className="Card">


        <CardHeader
          avatar={
            <Avatar aria-label="recipe" className={classes.avatar}>
              3
            </Avatar>
          }
          action={
            <Box>
            {state === "lock" &&
              <Tooltip title="Edit">

                <IconButton
                  aria-label="project-info-edit"
                  onClick={() => {}}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            }

            <Tooltip title="Help">

            <IconButton
              onClick={openHelp}
              aria-label="project-info-help"
            >
              <HelpIcon />
            </IconButton>
            </Tooltip>
            </Box>
          }
          title="Select prior knowledge"
        />

        <CardContent className="cardHighlight">
          <Typography
            variant="h4"
            noWrap={true}
          >
            {priorStats["n_inclusions"]} relevant documents
          </Typography>
          <Typography
            variant="h4"
            noWrap={true}
          >
            {priorStats["n_exclusions"]} irrelevant documents
          </Typography>
          <Box>


            {/* nothing */}
            {(priorStats['n_inclusions'] === 0 && priorStats['n_exclusions'] === 0) &&
              <Typography>
                You don't have prior knowledge yet. Find yourself prior knowledge by searching relevant papers and label some random papers. Wondering why we need this?
              </Typography>
            }

            {/* only inclusions, no exclusions */}
            {(priorStats['n_inclusions'] > 0 && priorStats['n_exclusions'] === 0) &&
              <Typography>
                Find yourself irrelevant items. Tip: label some random items. Random items are usually exclusions because the relevant items are rare.
              </Typography>
            }

            {/* only exclusions, no inclusions */}
            {(priorStats['n_inclusions'] === 0 && priorStats['n_exclusions'] > 0) &&
              <Typography>
                Find yourself relevant items. Tip: use the search function and find some relevant items you know of.
              </Typography>
            }


            {/* bare minimum was met */}
            {(priorStats['n_inclusions'] > 0 && priorStats['n_exclusions'] > 0 && (priorStats['n_exclusions'] < 3 || priorStats['n_inclusions'] < 3)) &&
              <Typography style={{ color: orange[500] }} >
                <CheckIcon/>
                Enough prior knowledge, however a bit more would help!
              </Typography>
            }

            {/* ready */}
            {(priorStats['n_inclusions'] >= 3 && priorStats['n_exclusions'] >= 3) &&
              <Typography style={{ color: green[500] }} >
                <CheckIcon/>
                Enough prior knowledge, feel free to go to the next step.
              </Typography>
            }


          </Box>
        </CardContent>

        <CardContent className="cardHighlight">
          <Button
            variant="outlined"
            color="primary"
            disabled={state === "search"}
            onClick={() => {changeMethod("search")}}
          >
            Search
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={state === "random"}
            onClick={() => {changeMethod("random")}}
          >
            Random
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={state === "file"}
            onClick={() => {changeMethod("file")}}
          >
            From file
          </Button>
        </CardContent>
        <Divider/>

      { state === "search" &&
        <PriorKnowledgeSearch
          project_id={props.project_id}
          updatePriorStats={updatePriorStats}
          includeItem={includeItem}
          resetItem={resetItem}
        />
      }

      { state === "random" &&
         <PriorKnowledgeRandom
          project_id={props.project_id}
          onClose={()=>{setState(null)}}
          updatePriorStats={updatePriorStats}
          includeItem={includeItem}
          excludeItem={excludeItem}
        />
      }

    </Paper>
    </Grow>

      }

      <Help
        open={help}
        onClose={closeHelp}
        title="Prior Knowledge"
        message={
          <Box>
          <Typography>Every active learning model likes a warm start. Prior knowledge is very important. </Typography>
          </Box>
        }
      />
    </Box>
  )
}

export default PriorKnowledge;

import React, {useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  Typography,
  Paper,
  CardHeader,
  CardContent,
  Divider,
  Tooltip,
  IconButton,
  Grow,
  Dialog,
  DialogContent,
  DialogActions,
} from '@material-ui/core'

import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';

import { green, brown } from '@material-ui/core/colors';

import {
  PriorKnowledgeSearch,
  PriorKnowledgeRandom,
  LabeledItems,
} from '../PreReviewComponents'

import {
  DialogTitleWithClose,
} from '../Components'

import {
  Help,
  useHelp,
} from '../PreReviewComponents'

import axios from 'axios'

import {
  api_url
} from '../globals.js';

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
  },
  navButton: {
    margin: "0px 12px"
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

  const [state, setState] = React.useState({
    "method": null,
    "loading": true,
  })

  const [priorDialog, setPriorDialog] = React.useState(false)

  const [priorStats, setPriorStats] = React.useState({
    "n_exclusions": null,
    "n_inclusions": null,
    "n_prior": null
  })
  const [help, openHelp, closeHelp] = useHelp()

  const updatePriorStats = () => {
    setState({
      "method": state.method,
      "loading": true,
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
    setState({
      "method": method,
      "loading": state.loading,
    });
  }

  useEffect(() => {

    if (state.loading){
      const url = api_url + `project/${props.project_id}/prior_stats`;

      axios.get(url)
      .then((result) => {

        setState(s => {return({
            ...s,
            "loading": false,
          })
        })

        setPriorStats(result.data);

      })
      .catch((error) => {
        console.log("Failed to load prior information");
      });
    }

  }, [state.loading, props.project_id]);


  useEffect(() => {

    // if (props.scrollToBottom !== undefined){
    //   // scroll to bottom
    //   props.scrollToBottom()
    // }

    // enable next button
    if (goNext()){
      props.setNext(true)
    } else {
      props.setNext(false)
    }

  }, [priorStats, goNext]);

  return (
    <Box
      style={{clear: "both"}}
    >

      {/* Display the prior info once loaded */}
      {priorStats.n_prior !== null &&

      <Grow
        in={true}
      >
        <Paper
          className="Card"
        >
          <CardHeader

            /* Prior card */
            title="Select prior knowledge"
            titleTypographyProps={{"color": "primary"}}

            /* The edit and help options */
            action={
              <Box>
                {priorStats['n_prior'] > 0 &&
                  <Tooltip title="Edit">

                    <IconButton
                      aria-label="project-prior-edit"
                      onClick={openPriorKnowledge}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                }
                <Tooltip title="Help">
                  <IconButton
                    onClick={openHelp}
                    aria-label="project-prior-help"
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />

          <CardContent
            className="cardHighlight"
          >
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
                  You don't have prior knowledge yet. Find yourself prior knowledge by searching relevant papers and label some random papers.
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
                <Typography>
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
              disabled={state.method === "search"}
              onClick={() => {changeMethod("search")}}
              className={classes.navButton}
            >
              Search
            </Button>

            <Button
              variant="outlined"
              color="primary"
              disabled={state.method === "random"}
              onClick={() => {changeMethod("random")}}
              className={classes.navButton}
            >
              Random
            </Button>

            {/*
            <Button
              variant="outlined"
              color="primary"
              disabled={state.method === "file"}
              onClick={() => {changeMethod("file")}}
              className={classes.navButton}
            >
              From file
            </Button>
            */}

          </CardContent>

          { state.method === "search" &&
            <Box>
              <Divider/>
              <CardContent>
                <PriorKnowledgeSearch
                  project_id={props.project_id}
                  updatePriorStats={updatePriorStats}
                  includeItem={includeItem}
                  excludeItem={excludeItem}
                  resetItem={resetItem}
                />
              </CardContent>
            </Box>
          }

          { state.method === "random" &&
            <PriorKnowledgeRandom
              project_id={props.project_id}
              onClose={()=>{changeMethod(null)}}
              updatePriorStats={updatePriorStats}
              includeItem={includeItem}
              excludeItem={excludeItem}
            />
          }

        </Paper>
      </Grow>

      }

      {/* Prior dialog */}
      <Dialog
        open={priorDialog}
        onClose={closePriorKnowledge}
        fullWidth={true}
      >
        <DialogTitleWithClose
          title={"Prior Knowledge"}
          onClose={closePriorKnowledge}
        />
        <DialogContent dividers={true}>
          <LabeledItems
            resetItem={resetItem}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closePriorKnowledge}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Help
        open={help}
        onClose={closeHelp}
        title="Prior Knowledge"
        message={
          <Box>
            <Typography variant="body2" gutterBottom>
              Providing the prior knowledge gives the active learning model a head start.
            </Typography>
            <Typography variant="body2" gutterBottom>
              Select at least 1 relevant and 1 irrelevant records.
              Relevant records can be found by searching for keywords, authors or titles.
              Irrelevant records can be drawn randomly from the dataset.
            </Typography>
          </Box>
        }
      />

    </Box>
  )
}

export default PriorKnowledge;

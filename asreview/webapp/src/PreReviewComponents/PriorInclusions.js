import React from 'react'
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
  SearchResultDialog,
  PaperCard,
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


const PriorInclusions = (props) => {
  const classes = useStyles();

  const [included, setIncluded] = React.useState([])

  const [searchDialog, setSearchDialog] = React.useState({
    open : false,
    query : ""
  });

  const [showHelp, setShowHelp] = React.useState(false);

  const onChangeSearch = (evt) => {
    setSearchDialog({
      open : false,
      query : evt.target.value
    })
  }

  const openSearchDialog = (evt) => {
    evt.preventDefault();

    setSearchDialog({
      open : true,
      query : searchDialog.query
    });

  }

  const closeSearchDialog = () => {
    setSearchDialog({
      open : false,
      query : ""
    });

    // refresh the prior inclusions
    getPriorIncluded();
  }

  const getPriorIncluded = () => {

    const url = api_url + `project/${props.project_id}/prior`;

    axios.get(url)
    .then((result) => {
      setIncluded(result.data['result']);
    })
    .catch((error) => {
      console.log(error);
    });

  }

  // const addIncluded = (item) => {
  //   console.log('Add item to included: ' + item['id'])
  //   // setIncluded([item].concat(included))
  //   // console.log(included)
  // }

  const removeIncluded = (item) => {
    console.log('Remove item to included: ' + item['id'])
  }

  // const removeIncluded2 = (item) => {
  //   console.log('Remove item to included: ' + item['id'])

  //   // refresh the prior inclusions
  //   getPriorIncluded();
  // }

  const toggleHelp = () => {
    setShowHelp(a => (!a));
  };

  return (
    <Box style={{clear: "both"}}>
      <Typography style={{display: "inline"}} variant="h5" align="left">
        Do you have publications to include?
      </Typography>
      <Typography style={{width: "25px",margin:"3px", float:"right", opacity: 0.5}}  align="right">
      <HelpIcon onClick={toggleHelp}/>
      </Typography>

      {showHelp &&
        <Typography className={classes.helptext}>
          <Box fontStyle="italic">
            Provide about 1 to 5 relevant publications based on prior knowledge.
          </Box>
        </Typography>
      }

    <Box>
    <Paper className={classes.paperRoot}>

      <form className={classes.root} noValidate autoComplete="off" onSubmit={openSearchDialog}>
        <FormControl
          fullWidth
          className={classes.margin}
          variant="outlined"
        >
          <OutlinedInput
            id="prior-search-input-included"
            placeholder="Search on keyword, author or title"
            value={searchDialog.query}
            onChange={onChangeSearch}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="search for papers"
                  type="submit"
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </form>

      {included.length > 0 &&
        <Box>
          <Typography>The following publications have been included:</Typography>

          {included.map((value, index) => {

            return (
                <PaperCard
                  id={value.id}
                  title={value.title}
                  abstract={value.abstract}
                  included={value.included}

                  removeButton={true}
                  getPriorIncluded={getPriorIncluded}
                  collapseAbstract={true}

                  // this component needs a key as well
                  key={`container-result-item-${value.id}`}
                />
            );
          })}

        </Box>
      }

      {(searchDialog.open && searchDialog.query !== "") &&
        <SearchResultDialog
          searchQuery={searchDialog.query}
          closeSearchDialog={closeSearchDialog}
          getPriorIncluded={getPriorIncluded}
          onRevertInclude={removeIncluded}
        />
      }
        </Paper>
        <Toolbar className={classes.clear}/>
      </Box>

      <Button
        variant="contained"
        color="primary"
        disabled={!(included.length > 0)}
        onClick={props.handleNext}
        className={classes.button}
      >
        Next
      </Button>

    </Box>
  )
}

export default connect(mapStateToProps)(PriorInclusions);

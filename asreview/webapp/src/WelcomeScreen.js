import React, {useEffect, useState} from 'react';

import {
  Box,
  Fade,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import './WelcomeScreen.css'
import {api_url} from "./globals";
import axios from "axios";

import { connect } from "react-redux";

// redux config
import store from './redux/store'
import { setAppState } from './redux/actions'


function mapDispatchToProps(dispatch) {
    return({
        setAppState: (app_state) => {dispatch(setAppState(app_state))}
    })
}


const useStyles = makeStyles(theme => ({
  background: {
    backgroundColor: "#8D6E63",
    height: "100%",
    width: "100%",
    position: "absolute",
  },
  root: {
    // width: 380,
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  },
  logo_single: {
    margin: 'auto',
    width: 160,
    fill: "white",
  },
  logo: {
    margin: 'auto',
    width: 380,
    fill: "white",
  },
  plusicon: {
    marginTop: "50px",
    marginBottom:"50px",
  },
  title: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "30px",
    color: "white",
  },
  error: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "30px",
    backgroundColor: "#FFF",
  },
  title_small: {
    fontSize: "20px"
  }
}));

const WelcomeScreen = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    "loading": true,
    "bootInfo" : null,
    "error": null,
    "animation": false,
  })

  useEffect(() => {
    const fetchData = async () => {
      await axios.get(api_url + "boot")
          .then(result => {

            // skip the loader when you are in development mode
            if (result.data['status'] === 'development') {
              props.setAppState("projects");
            } else {
              setState({
                "loading": false,
                "bootInfo" : result.data,
                "animation": true,
                "error": null,
              })
            }
          })
          .catch(err => {
            setState({
              ...state,
              "loading": true,
              "error": true
            });
          })
    }
    if (state.loading){
        fetchData();
    }
  }, [state.loading]);

  if (state.loading) {
    return null
  }

  if (!state.loading && state.error) {
    return (
      <Box className={classes.background}>
        <Typography className={classes.error} color='error'>
          Error - failed to connect with server
        </Typography>
      </Box>
    );
  }

  /* no errors, continue with bootloading */
  if (!state.loading && !state.error) {
    return (
      <Fade
          in={state.animation}
          timeout={{enter: 0, exit: 600}}
          mountOnEnter
          unmountOnExit
          onEnter={()=> {
            setTimeout(()=> {
              setState({
                ...state,
                "animation": false,
              })

            }, 3000)
          }}
          onExited={() => {
            props.setAppState("projects");
          }}
      >
        <Box className={classes.background}>
          <Box className={classes.root} >
            <div className={state.bootInfo.status === 'asreview' ? classes.logo_single : classes.logo}>
              <span>
                <svg width="160px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M17.3,3.9a4.4,4.4,0,0,0,2.4-1A1.2,1.2,0,0,0,19.6,1,3.9,3.9,0,0,0,17.1.3a6.4,6.4,0,0,0-2.7.7,5.7,5.7,0,0,0-2.7,3.4c-3.6.1-6.8,3.5-7.1,7.9A8.6,8.6,0,0,0,8,20c-1.2.3-2,1-2,1.8s1.3,1.8,2.9,1.8a3,3,0,0,0,2.7-1.2,3.4,3.4,0,0,0,2.8,1.2c1.6,0,2.9-.8,2.9-1.8s-.9-1.6-2.2-1.8a8.8,8.8,0,0,0,3.6-6.7c.3-4.2-2.1-7.9-5.5-8.7a2.9,2.9,0,0,1,1.3-.5A24.6,24.6,0,0,1,17.3,3.9ZM14.8,8.7a1.7,1.7,0,0,1,1.6,1.7v1.3a1.6,1.6,0,0,1-1.6,1.6H8.5a1.6,1.6,0,0,1-1.6-1.6V10.4A1.7,1.7,0,0,1,8.5,8.7Z"/>
                  <path d="M7.9,11.7a.5.5,0,0,0,.5.4.4.4,0,0,0,.4-.4.9.9,0,0,1,.8-.8.9.9,0,0,1,.8.8.4.4,0,0,0,.4.4.5.5,0,0,0,.5-.4A1.8,1.8,0,0,0,9.6,10,1.8,1.8,0,0,0,7.9,11.7Z"/>
                  <path d="M12.5,12.1a.4.4,0,0,0,.4-.4.8.8,0,1,1,1.6,0,.4.4,0,0,0,.4.4.5.5,0,0,0,.5-.4,1.7,1.7,0,0,0-3.4,0A.5.5,0,0,0,12.5,12.1Z"/>
                </svg>
              </span>
              {state.bootInfo.status === 'asreview-covid19' && (
                <span>
                  <svg width="60px" className={classes.plusicon} viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
                  <svg width="160px" className="rotate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.7,12.1c0,.9.3,1.5.7,1.5s.7-.8.7-1.7-.4-1.7-.8-1.7-.6.6-.7,1.5h-1A7.9,7.9,0,0,0,17,9.5l.9-.5c.5.7,1.1,1.1,1.4.9s.2-1-.3-1.9-1.1-1.3-1.4-1.1-.3.9.1,1.6l-.9.6a9.1,9.1,0,0,0-1.7-1.7l.5-.9c.8.3,1.5.4,1.6.1s-.3-1-1.1-1.5-1.6-.6-1.8-.2.2.9.9,1.3l-.5,1h0a7.7,7.7,0,0,0-2.6-.7V5.4c.9,0,1.5-.3,1.5-.7S12.8,4,11.9,4s-1.7.4-1.7.8.6.6,1.5.6V6.5a4.4,4.4,0,0,0-2.3.6h0l-.6-.9c.6-.5,1-1.1.8-1.4s-1-.1-1.8.4-1.3,1.2-1,1.6.9.1,1.6-.3l.6.9A4.9,4.9,0,0,0,7,9.1l-.9-.6c.4-.7.4-1.4.1-1.6s-1,.3-1.4,1.2-.6,1.6-.3,1.8.9-.2,1.4-.9l.9.5a3.9,3.9,0,0,0-.6,2.1H5.1c0-.8-.3-1.4-.7-1.4s-.7.7-.7,1.7.3,1.7.7,1.7.7-.6.7-1.5H6.2a4.8,4.8,0,0,0,.7,2.4l-.9.6c-.5-.6-1.1-1-1.4-.8s-.2,1.1.4,1.8,1.3,1.3,1.6,1,.1-.9-.3-1.6l.9-.6a5.2,5.2,0,0,0,1.7,1.6h0l-.5,1c-.7-.3-1.5-.3-1.6,0s.4.9,1.3,1.3,1.6.5,1.8.1-.3-.8-1-1.2l.4-1a6,6,0,0,0,2.4.5h-.1v1.2c-.8,0-1.4.3-1.4.7s.7.7,1.7.7,1.7-.4,1.7-.7-.6-.7-1.5-.7V17.2h0a5.9,5.9,0,0,0,2.3-.5l.6.9c-.7.5-1.1,1.1-.9,1.4s1,.1,1.8-.4,1.3-1.2,1.1-1.5-.9-.2-1.6.2l-.6-.8a5.2,5.2,0,0,0,1.9-1.7l.9.5c-.4.8-.4,1.5-.1,1.6s1-.3,1.4-1.1.6-1.7.3-1.8-.9.2-1.4.9l-.9-.5a6.2,6.2,0,0,0,.7-2.3Z"/></svg>
                </span>
              )}
            </div>
            <Typography className={classes.title}>
              ASReview
              {state.bootInfo.status === 'asreview-covid19' && (
                <span>
                  <span className={classes.title_small}> against</span> COVID-19
                </span>
              )}
            </Typography>
          </Box>
        </Box>
      </Fade>
    );
  }

}


export default connect(
  null,
  mapDispatchToProps
)(WelcomeScreen);

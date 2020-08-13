
// When you're running the development server, the javascript code is always
// pointing to localhost:5000. In all other configurations, the api url point to
// the host domain.
export const api_url = ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port === "3000") ? "http://localhost:5000/api/" : "/api/";

export const donateURL = "https://asreview.nl/donate";

// review drawer configs
export const reviewDrawerWidth = 250;

// review screen configs
export const decisionUndoBarDuration = 6000;
export const decisionUndoBarMarginBottom = 56;

// functions
export const mapStateToProps = state => {
  return { project_id: state.project_id };
};


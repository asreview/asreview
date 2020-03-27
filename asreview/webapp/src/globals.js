
// when you running the development server, the javascript code is always
// pointing to localhost:5000. In all other configurations,
export const api_url = ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port === "3000") ? "http://localhost:5000/api/" : "/api/";

export const reviewDrawerWidth = 250;

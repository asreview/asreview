// if (process.env.NODE_ENV !== 'development') {
//   console.log('Skipping config load: Not in development mode');
//   process.exit(0);
// }

const fs = require("fs");
const toml = require("toml");

// Load and parse the TOML file, can this be an argument? Also on Windows?
const config = toml.parse(
  fs.readFileSync("../../asreview_config.toml", "utf-8"),
);

// Map shared variables to React environment variables
const reactConfig = {
  REACT_APP_API_URL: config.API_URL || "http://localhost:5000/",
  REACT_APP_ASREVIEW_VERION: config.VERSION || "dev.version",
  REACT_APP_AUTHENTICATION:
    config.AUTHENTICATION !== undefined ? config.AUTHENTICATION : true,
  REACT_APP_LOGIN_INFO: config.LOGIN_INFO || "Development app",
  REACT_APP_ALLOW_ACCOUNT_CREATION:
    config.ALLOW_ACCOUNT_CREATION !== undefined
      ? config.ALLOW_ACCOUNT_CREATION
      : true,
  REACT_APP_ALLOW_TEAMS:
    config.ALLOW_TEAMS !== undefined ? config.ALLOW_TEAMS : true,
  REACT_APP_EMAIL_VERIFICATION:
    config.EMAIL_VERIFICATION !== undefined ? config.EMAIL_VERIFICATION : false,
  REACT_APP_OAUTH: "{}", // TODO
};

// Write .env file
const envContent = Object.entries(reactConfig)
  .map(([key, value]) => {
    // in case this is not a boolean
    if (!(value === true || value === false)) {
      return `${key}="${value}"`;
    }
    return `${key}=${value}`;
  })
  .join("\n");

fs.writeFileSync("./.env.development", envContent);
console.log(".env.development has been created/updated");

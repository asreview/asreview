import { useEffect, useState } from "react";
import brown from "@material-ui/core/colors/brown";
import red from "@material-ui/core/colors/red";

import { fontSize } from "../globals.js";

const useDarkMode = () => {
  let lightTheme = {
    palette: {
      type: "light",
      primary: {
        main: brown[500],
      },
    },
    overrides: {
      debug: {
        color: "#1E824C",
      },
      MuiLink: {
        root: {
          color: "#DC004E",
        },
      },
      MuiTypography: {
        colorTextSecondary: {
          color: "#555555",
        },
      },
    },
  };

  let darkTheme = {
    palette: {
      type: "dark",
      primary: {
        main: brown[500],
      },
      secondary: {
        main: red[500],
      },
    },
    overrides: {
      debug: {
        color: "#65A665",
      },
      MuiLink: {
        root: {
          color: "#F48FB1",
        },
      },
      MuiButton: {
        textPrimary: {
          color: "#CFA596",
        },
        outlinedPrimary: {
          color: "#CFA596",
        },
      },
      MuiTypography: {
        colorPrimary: {
          color: "#CFA596",
        },
      },
      MuiFormLabel: {
        root: {
          "&$focused": {
            color: "#CFA596",
          },
        },
      },
      MuiTab: {
        textColorPrimary: {
          "&$selected": {
            color: "#CFA596",
          },
        },
      },
    },
  };

  const [theme, setTheme] = useState(lightTheme);

  const toggleDarkMode = () => {
    if (theme.palette.type === "light") {
      window.localStorage.setItem("themeType", "dark");
      setTheme(darkTheme);
    } else {
      window.localStorage.setItem("themeType", "light");
      setTheme(lightTheme);
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("themeType");
    if (theme.palette.type !== localTheme && localTheme !== null) {
      setTheme(darkTheme);
    }
  }, [darkTheme, theme.palette.type]);

  return [theme, toggleDarkMode];
};

const useTextSize = () => {
  const [textSize, setTextSize] = useState(fontSize[1]);

  const handleTextSizeChange = (size) => {
    window.localStorage.setItem("textSize", JSON.stringify([size.value, size.label]));
    setTextSize(size);
  };

  useEffect(() => {
    const localTextSize = JSON.parse(window.localStorage.getItem("textSize"));
    if (localTextSize !== null && textSize.value !== localTextSize[0]) {
      setTextSize({
        value: localTextSize[0],
        label: localTextSize[1],
      });
    }
  }, [textSize]);

  return [textSize, handleTextSizeChange];
};

const useUndoEnabled = () => {
  const [undoEnabled, setUndoEnabled] = useState(true);

  const toggleUndoEnabled = () => {
    window.localStorage.setItem("undoEnabled", !undoEnabled);
    setUndoEnabled((a) => !a);
  };

  useEffect(() => {
    const localUndoEnabled = window.localStorage.getItem("undoEnabled");
    const localUndoEnabledIsTrue = localUndoEnabled === "true";
    if (undoEnabled !== localUndoEnabledIsTrue && localUndoEnabled !== null) {
      setUndoEnabled(localUndoEnabledIsTrue);
    }
  }, [undoEnabled]);

  return [undoEnabled, toggleUndoEnabled];
};

const useKeyPressEnabled = () => {
  const [keyPressEnabled, setKeyPressEnabled] = useState(false);

  const toggleKeyPressEnabled = () => {
    window.localStorage.setItem("keyPressEnabled", !keyPressEnabled);
    setKeyPressEnabled((a) => !a);
  };

  useEffect(() => {
    const localKeyPressEnabled = window.localStorage.getItem("keyPressEnabled");
    const localKeyPressEnabledIsTrue = localKeyPressEnabled === "true";
    if (
      keyPressEnabled !== localKeyPressEnabledIsTrue &&
      localKeyPressEnabled !== null
    ) {
      setKeyPressEnabled(localKeyPressEnabledIsTrue);
    }
  }, [keyPressEnabled]);

  return [keyPressEnabled, toggleKeyPressEnabled];
};

export { useDarkMode, useTextSize, useUndoEnabled, useKeyPressEnabled };

import { useEffect, useState } from "react";
import brown from "@material-ui/core/colors/brown";
import red from "@material-ui/core/colors/red";

import { fontSizeOptions } from "../globals.js";

const useDarkMode = () => {
  let lightTheme = {
    palette: {
      type: "light",
      primary: {
        main: brown[500],
      },
    },
    overrides: {
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
      MuiDialog: {
        paper: {
          backgroundColor: "#fafafa",
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
      MuiDialog: {
        paper: {
          backgroundColor: "#303030",
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

const useFontSize = () => {
  const [fontSize, setFontSize] = useState(fontSizeOptions[1]);

  const handleFontSizeChange = (size) => {
    window.localStorage.setItem(
      "fontSize",
      JSON.stringify([size.value, size.label])
    );
    setFontSize(size);
  };

  useEffect(() => {
    const localFontSize = JSON.parse(window.localStorage.getItem("fontSize"));
    if (localFontSize !== null && fontSize.value !== localFontSize[0]) {
      setFontSize({
        value: localFontSize[0],
        label: localFontSize[1],
      });
    }
  }, [fontSize]);

  return [fontSize, handleFontSizeChange];
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

export { useDarkMode, useFontSize, useUndoEnabled, useKeyPressEnabled };

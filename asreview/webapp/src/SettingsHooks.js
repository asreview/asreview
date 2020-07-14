import { useEffect, useState } from 'react'
import brown from '@material-ui/core/colors/brown';


const useDarkMode = () => {

  let defaultTheme = {
    palette: {
      type: "light",
      primary: brown,
    },
  };

  const [theme, setTheme] = useState(defaultTheme);

  const toggleDarkMode = () => {

    if (theme.palette.type === "light") {
      window.localStorage.setItem("themeType", "dark")
      setTheme({palette: {...defaultTheme.palette, type: "dark"}})
    } else {
      window.localStorage.setItem("themeType", "light")
      setTheme(defaultTheme)
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("themeType");
    if (theme.palette.type !== localTheme && localTheme !== null) {
      setTheme({palette: {...defaultTheme.palette, type: "dark"}})
    }
  }, [defaultTheme.palette, theme.palette.type]);

  return [theme, toggleDarkMode]
};


const useTextSize = () => {

  const [textSize, setTextSize] = useState("normal");

  const handleTextSizeChange = (event) => {

    window.localStorage.setItem("textSize", event.target.value)
    setTextSize(event.target.value);
  };

  useEffect(() => {
    const localTextSize = window.localStorage.getItem("textSize");
    if (textSize !== localTextSize && localTextSize !== null) {
      setTextSize(localTextSize)
    }
  }, [textSize]);

  return [textSize, handleTextSizeChange]
};


export { useDarkMode, useTextSize };

import { useEffect, useState } from 'react'
import { createMuiTheme } from '@material-ui/core'
import brown from '@material-ui/core/colors/brown';

const lightTheme = createMuiTheme({
  palette: {
    type: "light",
    primary: brown,
  },
});

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: brown,
  },
});

const useDarkMode = () => {

  const [theme, setTheme] = useState(lightTheme)

  const toggleDarkMode = () => {

    if (theme.palette.type === "light") {
      window.localStorage.setItem("theme", "dark")
      setTheme(darkTheme)
    } else {
      window.localStorage.setItem("theme", "light")
      setTheme(lightTheme)
    }
  }

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme")
    if (theme.palette.type !== localTheme) {
      setTheme(darkTheme)
    }
  }, [theme.palette.type])

  return [theme, toggleDarkMode]
}

export default useDarkMode;
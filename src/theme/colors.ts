const grey = {
  0: "#FFFFFF",
  50: "#FBFBF9",
  100: "#EAEAE5",
  200: "#F9FAFB",
  300: "#D0D0C8",
  400: "#C4CDD5",
  500: "#9A9A98",
  600: "#637381",
  700: "#5D5D5B",
  800: "#212B36",
  900: "#363634",
};

const green = {
  0: "#FFFFFF",
  100: "#F0FFF6",
  300: "#89F0B2",
  500: "#3DC674",
  700: "#349056",
  900: "#18442A",
};

const main = {
  100: green[100],
  300: green[300],
  500: green[500],
  700: green[700],
  900: green[900],
};

const primary = {
  lighter: "#D0ECFE",
  light: "#73BAFB",
  main: "#1877F2",
  dark: "#0C44AE",
  darker: "#042174",
  contrastText: "#FFFFFF",
};

const secondary = {
  lighter: "#EFD6FF",
  light: "#C684FF",
  main: "#8E33FF",
  dark: "#5119B7",
  darker: "#27097A",
  contrastText: "#FFFFFF",
};

const info = {
  lighter: "#CAFDF5",
  light: "#61F3F3",
  main: "#00B8D9",
  dark: "#006C9C",
  darker: "#003768",
  contrastText: "#FFFFFF",
};

const success = {
  lighter: "#C8FAD6",
  light: "#5BE49B",
  main: "#00A76F",
  dark: "#007867",
  darker: "#004B50",
  contrastText: "#FFFFFF",
};

const warning = {
  lighter: "#FFF5CC",
  light: "#FFD666",
  main: "#FFAB00",
  dark: "#B76E00",
  darker: "#7A4100",
  contrastText: grey[800],
};

const error = {
  lighter: "#FFE9D5",
  light: "#FFAC82",
  main: "#FF5630",
  dark: "#B71D18",
  darker: "#7A0916",
  contrastText: "#FFFFFF",
};

const red = {
  100: "#FEF8F8",
  300: "#FEF8F8",
  500: "#F4CACA",
  900: "#DB4D4D",
};

const yellow = {
  900: "#FEAF06",
};

const green_support = {
  100: "#F6FDF7",
  500: "#AEEAB3",
  900: "#3ACB46",
};

const purple = {
  900: "#C3099A",
};

const dark_purple = {
  900: "#6B0861",
};

const dark_red = {
  900: "#800202",
};

const common = {
  black: "#000000",
  white: "#FFFFFF",
};

export const palette = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  grey,
  main,
  common,
  red,
  yellow,
  green_support,
  purple,
  dark_purple,
  dark_red,
};

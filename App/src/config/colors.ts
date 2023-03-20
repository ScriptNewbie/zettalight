export type ColorMode = "light" | "dark";

type ColorScheme = {
  soft: string;
  apply: string;
  discard: string;
  primary: string;
  background: string;
  white: string;
  primaryButton: string;
  secondaryButton: string;
  disabled: string;
  warning: string;
};

const common = {
  soft: "grey",
  apply: "green",
  discard: "red",
  white: "white",
  primaryButton: "grey",
  secondaryButton: "rgb(20,128,250)",
  warning: "#E4D00A",
};

const lightModeColors: ColorScheme = {
  ...common,
  primary: "black",
  background: "white",
  disabled: "#d8d8d8",
};

const darkModeColors: ColorScheme = {
  ...common,
  primary: "white",
  background: "black",
  disabled: "#252525",
};

const colors = {
  light: lightModeColors,
  dark: darkModeColors,
};

export default colors;

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    brand: Palette["primary"];
  }
  interface PaletteOptions {
    brand?: PaletteOptions["primary"];
  }
}

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1d4ff3", contrastText: "#fff" },
    brand: { main: "#1d4ffe" },
    background: { default: "#f5f5f5", paper: "#ffffff" },
    text: { primary: "#08060d", secondary: "#6b6375" },
    divider: "#e5e4e7",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: `system-ui, 'Segoe UI', Roboto, sans-serif`,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        // widen Container maxWidth="lg" from MUI's default 1200px to 1400px,
        // without touching theme.breakpoints.values.lg (that also drives
        // every responsive `sx={{ ... lg: ... }}` breakpoint in the app)
        maxWidthLg: ({ theme }) => ({
          [theme.breakpoints.up("lg")]: {
            maxWidth: 1400,
          },
        }),
      },
    },
  },
});

export default theme;

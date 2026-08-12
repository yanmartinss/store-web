import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary']
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary']
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#08060d' },
    brand: { main: '#1e6fd9' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#08060d', secondary: '#6b6375' },
    divider: '#e5e4e7',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: `system-ui, 'Segoe UI', Roboto, sans-serif`,
  },
})

export default theme

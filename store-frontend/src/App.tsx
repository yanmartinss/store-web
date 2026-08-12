import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Header from './components/Header/Header'
import BannerCarousel from './components/Home/BannerCarousel'

function App() {
  return (
    <>
      <Header />
      <Box component="main" sx={{ bgcolor: 'background.default', minHeight: '100svh' }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <BannerCarousel />
        </Container>
      </Box>
    </>
  )
}

export default App

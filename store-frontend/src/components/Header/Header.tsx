import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import TopBar from './TopBar'
import HeaderMain from './HeaderMain'
import MobileMenu from './MobileMenu'
import SearchBar from './SearchBar'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
        <TopBar />
        <HeaderMain onMenuToggle={() => setMenuOpen((prev) => !prev)} menuOpen={menuOpen} />
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        <Container maxWidth="lg" sx={{ pb: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider', display: { xs: 'block', md: 'none' } }}>
          <SearchBar />
        </Container>
      </AppBar>
    </>
  )
}

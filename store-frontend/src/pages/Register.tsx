import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'

export default function Register() {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100svh',
        gap: 1,
        p: 2,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Criar conta
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Página em construção.
      </Typography>
      <Link href="/" underline="hover">
        Voltar para a Home
      </Link>
    </Box>
  )
}

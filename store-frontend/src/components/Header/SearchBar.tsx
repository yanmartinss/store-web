import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'

export default function SearchBar() {
  return (
    <Paper
      component="form"
      elevation={0}
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        px: 1,
        transition: 'border-color 0.2s',
        '&:focus-within': {
          borderColor: 'text.primary',
        },
      }}
    >
      <InputBase
        placeholder="O que você procura?"
        sx={{ flex: 1 }}
        inputProps={{ 'aria-label': 'Buscar produtos' }}
      />
      <IconButton type="submit" aria-label="Buscar" size="small">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

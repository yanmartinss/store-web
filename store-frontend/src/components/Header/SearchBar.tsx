import { useRef, type FormEvent } from 'react'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function SearchBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = inputRef.current?.value.trim() ?? ''
    if (term) {
      navigate(`/busca?q=${encodeURIComponent(term)}`)
    } else {
      navigate('/busca')
    }
  }

  return (
    <Paper
      component="form"
      elevation={0}
      onSubmit={handleSubmit}
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        px: 1,
      }}
    >
      <InputBase
        key={urlQuery}
        defaultValue={urlQuery}
        inputRef={inputRef}
        placeholder="O que você procura?"
        sx={{ flex: 1, '& input:focus': { outline: 'none' } }}
        inputProps={{ 'aria-label': 'Buscar produtos' }}
      />
      <IconButton type="submit" aria-label="Buscar" size="small">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

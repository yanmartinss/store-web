import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { NAV_ITEMS } from './navItems'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <Collapse in={open} unmountOnExit>
      <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <List disablePadding>
          {NAV_ITEMS.map((item, index) => (
            <Box key={item.href}>
              <ListItem disablePadding>
                <ListItemButton component="a" href={item.href} onClick={onClose} sx={{ px: 0, py: 1 }}>
                  <ListItemText primary={item.label} />
                  <ChevronRightIcon sx={{ color: 'brand.main' }} />
                </ListItemButton>
              </ListItem>
              {index < NAV_ITEMS.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Box>
    </Collapse>
  )
}

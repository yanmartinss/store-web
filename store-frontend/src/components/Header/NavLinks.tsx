import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";

const NavLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.secondary,
  fontSize: "0.85rem",
  fontWeight: 600,
  letterSpacing: 0.6,
  padding: theme.spacing(0.5, 1),
  whiteSpace: "nowrap",
  transition: "color 0.2s",
  "&:hover": {
    color: theme.palette.text.primary,
  },
}));

export default function NavLinks() {
  return (
    <Box
      component="nav"
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} to={item.href}>
          {item.label}
        </NavLink>
      ))}
    </Box>
  );
}

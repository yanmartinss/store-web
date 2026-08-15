import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";

interface HeaderMainProps {
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export default function HeaderMain({ onMenuToggle, menuOpen }: HeaderMainProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const logo =
    theme.palette.mode === "dark"
      ? "/assets/ui/logo-white.png"
      : "/assets/ui/logo-black.png";

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
        {isDesktop ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", height: 40, mr: 4, lineHeight: 0 }}>
              <Link to="/" style={{ lineHeight: 0, display: "block" }}>
                <Box
                  component="img"
                  src={logo}
                  alt="Logo da loja"
                  sx={{ height: 40, display: "block" }}
                />
              </Link>
            </Box>
            <Box sx={{ ml: 2 }}>
              <NavLinks />
            </Box>
            <SearchBar />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <IconButton aria-label="Minha conta">
                <PersonOutlinedIcon />
              </IconButton>
              <IconButton aria-label="Carrinho">
                <Badge badgeContent={0} color="error">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </IconButton>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", height: 32, lineHeight: 0 }}>
                <Link to="/" style={{ lineHeight: 0, display: "block" }}>
                  <Box
                    component="img"
                    src={logo}
                    alt="Logo da loja"
                    sx={{ height: 32, display: "block" }}
                  />
                </Link>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 0.25,
              }}
            >
              <IconButton aria-label="Minha conta">
                <Box
                  component="img"
                  src="/assets/ui/user-line.png"
                  alt="Minha conta"
                  sx={{ width: 24, height: 24 }}
                />
              </IconButton>
              <IconButton aria-label="Carrinho">
                <Badge badgeContent={0} color="error">
                  <Box
                    component="img"
                    src="/assets/ui/shopping-bag-4-line.png"
                    alt="Carrinho"
                    sx={{ width: 24, height: 24 }}
                  />
                </Badge>
              </IconButton>
              <IconButton
                onClick={onMenuToggle}
                aria-label="Menu"
                sx={{
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "brand.main",
                  },
                  "&:hover img": {
                    filter: "brightness(0) invert(1)",
                  },
                  ...(menuOpen ? { bgcolor: "brand.main" } : {}),
                }}
              >
                <Box
                  component="img"
                  src="/assets/ui/menu-line.png"
                  alt="Menu"
                  sx={{
                    width: 24,
                    height: 24,
                    transition: "filter 0.2s",
                    filter: menuOpen ? "brightness(0) invert(1)" : "none",
                  }}
                />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}

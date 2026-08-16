import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Link, useNavigate } from "react-router-dom";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import api from "../../services/api";
import { useCartStore } from "../../store/cart";
import { useAuthStore } from "../../store/auth";

interface HeaderMainProps {
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export default function HeaderMain({
  onMenuToggle,
  menuOpen,
}: HeaderMainProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const authenticated = useAuthStore((state) => state.authenticated);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    try {
      await api.post("/user/logout");
    } finally {
      setAuthenticated(false);
      navigate("/");
    }
  };

  const logo =
    theme.palette.mode === "dark"
      ? "/assets/ui/logo-white.png"
      : "/assets/ui/logo-black.png";

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
          {isDesktop ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: 40,
                  mr: 4,
                  lineHeight: 0,
                }}
              >
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
                {authenticated !== true && (
                  <Tooltip title="Login">
                    <IconButton aria-label="Login" component={Link} to="/login">
                      <PersonOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Carrinho">
                  <IconButton aria-label="Carrinho" component={Link} to="/cart">
                    <Badge badgeContent={cartCount} color="error">
                      <ShoppingBagOutlinedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                {authenticated === true && (
                  <Tooltip title="Sair">
                    <IconButton
                      aria-label="Sair"
                      onClick={() => setLogoutConfirmOpen(true)}
                    >
                      <LogoutIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: 32,
                    lineHeight: 0,
                  }}
                >
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
                {authenticated !== true && (
                  <Tooltip title="Login">
                    <IconButton aria-label="Login" component={Link} to="/login">
                      <Box
                        component="img"
                        src="/assets/ui/user-line.png"
                        alt="Login"
                        sx={{ width: 24, height: 24 }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
                {authenticated === true && (
                  <Tooltip title="Sair">
                    <IconButton
                      aria-label="Sair"
                      onClick={() => setLogoutConfirmOpen(true)}
                    >
                      <LogoutIcon sx={{ width: 24, height: 24 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Carrinho">
                  <IconButton aria-label="Carrinho" component={Link} to="/cart">
                    <Badge badgeContent={cartCount} color="error">
                      <Box
                        component="img"
                        src="/assets/ui/shopping-bag-4-line.png"
                        alt="Carrinho"
                        sx={{ width: 24, height: 24 }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>
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

      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
      >
        <DialogTitle>Sair da conta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja sair da sua conta?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Sair
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

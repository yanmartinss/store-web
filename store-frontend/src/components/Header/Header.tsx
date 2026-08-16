import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import TopBar from "./TopBar";
import HeaderMain from "./HeaderMain";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import api from "../../services/api";
import { useAuthStore } from "../../store/auth";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  // Header is mounted once for the whole app (outside <Routes>), so this
  // runs a single time on load rather than per-page. There's no dedicated
  // "am I logged in" endpoint, so an authenticated-only GET is used as a
  // cheap proxy: 200 means logged in, 401 means not.
  useEffect(() => {
    api
      .get("/user/addresses")
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false));
  }, [setAuthenticated]);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <TopBar />
        {!isAuthPage && (
          <>
            <HeaderMain
              onMenuToggle={() => setMenuOpen((prev) => !prev)}
              menuOpen={menuOpen}
            />
            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
            <Container
              maxWidth="lg"
              sx={{
                pb: 1.5,
                pt: 1.5,
                borderTop: 1,
                borderColor: "divider",
                display: { xs: "block", md: "none" },
              }}
            >
              <SearchBar />
            </Container>
          </>
        )}
      </AppBar>
    </>
  );
}

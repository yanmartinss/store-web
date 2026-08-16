import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Category from "./pages/Category";
import SearchResults from "./pages/SearchResults";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import ScrollToTop from "./components/ScrollToTop";

function AppContent() {
  const location = useLocation();
  const hideFooter =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/busca"
          element={<SearchResults key={location.pathname + location.search} />}
        />
        <Route
          path="/product/:id"
          element={<Product key={location.pathname} />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/:slug"
          element={<Category key={location.pathname + location.search} />}
        />
      </Routes>
      {!hideFooter && <Footer />}
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

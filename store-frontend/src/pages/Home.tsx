import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import BannerCarousel from "../components/Home/BannerCarousel";
import BenefitsCards from "../components/Home/BenefitsCards";
import ProductSection from "../components/Home/ProductSection";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{ bgcolor: "background.default", minHeight: "100svh" }}
    >
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <BannerCarousel />
        <BenefitsCards />
        <ProductSection
          title="Produtos mais vistos"
          subtitle="Campeões de visualização da nossa loja."
          orderBy="views"
          limit={4}
        />
        <ProductSection
          title="Produtos mais vendidos"
          subtitle="Campeões de vendas da nossa loja."
          orderBy="selling"
          limit={4}
        />
      </Container>
    </Box>
  );
}

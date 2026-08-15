import { useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const FOOTER_SECTIONS = ["Camisas", "Kit B7Web", "Acessórios", "Eletrônicos"];

const HELP_CONTACTS = [
  {
    icon: "/assets/ui/mail-line.png",
    alt: "E-mail",
    label: "suporte@store.com.br",
  },
  {
    icon: "/assets/ui/phone-line.png",
    alt: "Telefone",
    label: "(85) 99999-9999",
  },
];

const SOCIAL_ICONS = [
  { src: "/assets/ui/instagram-line.png", alt: "Instagram" },
  { src: "/assets/ui/linkedin-line.png", alt: "LinkedIn" },
  { src: "/assets/ui/facebook-line.png", alt: "Facebook" },
  { src: "/assets/ui/twitter-x-fill.png", alt: "X" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setError("Informe um e-mail válido.");
      return;
    }
    setError("");
    setEmail("");
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 3, sm: 4 }, textAlign: "center" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
            alignItems: "stretch",
            "@media (min-width:640px)": {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 4,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              "@media (max-width:640px)": {
                flexDirection: "column",
              },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              component="img"
              src="/assets/ui/mail-send-line.png"
              alt="Newsletter"
              sx={{ width: 56, height: 56 }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  fontSize: { xs: 20, sm: 22 },
                }}
              >
                Fique por dentro das promoções!
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 15, color: "gray" }}>
                Coloque seu e-mail e seja o primeiro a saber
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              alignItems: "stretch",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              "@media (min-width:640px)": {
                flex: 1,
                flexDirection: "row",
                alignItems: "flex-start",
              },
            }}
          >
            <TextField
              type="email"
              placeholder="Qual é o seu e-mail?"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              error={Boolean(error)}
              helperText={error}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "divider",
                  },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "divider",
                  },
                "@media (min-width:640px)": {
                  flex: 1,
                  width: "auto",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "brand.main",
                whiteSpace: "nowrap",
                px: 3,
                height: 56,
                width: "100%",
                "@media (min-width:640px)": {
                  width: "auto",
                },
              }}
            >
              Enviar
            </Button>
          </Box>
        </Box>
      </Container>

      <Box sx={{ bgcolor: "#000", color: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              alignItems: "center",
              "@media (min-width:640px)": {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              },
            }}
          >
            <Box
              component="img"
              src="/assets/ui/logo-white.png"
              alt="Logo da loja"
              sx={{ height: 40, display: "block" }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 5,
                "@media (min-width:640px)": {
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 4,
                },
              }}
            >
              {FOOTER_SECTIONS.map((section) => (
                <Link
                  key={section}
                  href="#"
                  color="inherit"
                  underline="hover"
                  sx={{ fontSize: 15, fontWeight: "bold" }}
                >
                  {section}
                </Link>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              my: 3,
              borderTop: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateAreas: {
                xs: `"helpTitle"
                     "helpContent"
                     "socialTitle"
                     "socialContent"`,
                sm: `"helpTitle socialTitle"
                     "helpContent socialContent"`,
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                gridArea: "helpTitle",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Precisa de ajuda?
            </Typography>

            <Box
              sx={{
                gridArea: "helpContent",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
                "@media (min-width:640px)": {
                  flexDirection: "row",
                  flexWrap: "wrap",
                  rowGap: 1,
                  alignItems: "flex-start",
                },
              }}
            >
              {HELP_CONTACTS.map((contact, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    justifyContent: "center",
                    gap: 1,
                    border: 1,
                    borderColor: "rgba(255,255,255,0.25)",
                    borderRadius: 1,
                    px: 1.5,
                    py: 1.5,
                    width: "100%",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(30, 111, 217, 0.2)",
                    },
                    "@media (min-width:640px)": {
                      width: "auto",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={contact.icon}
                    alt={contact.alt}
                    sx={{ width: 20, height: 20 }}
                  />
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {contact.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                gridArea: "socialTitle",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Acompanhe nas redes sociais
            </Typography>

            <Box
              sx={{
                gridArea: "socialContent",
                display: "flex",
                justifyContent: "center",
                gap: 1,
                "@media (min-width:640px)": {
                  justifyContent: "flex-start",
                },
              }}
            >
              {SOCIAL_ICONS.map((social) => (
                <Box
                  key={social.alt}
                  component="a"
                  href="#"
                  aria-label={social.alt}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: 1,
                    borderColor: "rgba(255,255,255,0.25)",
                    borderRadius: 1,
                    px: 1.5,
                    py: 1.5,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(30, 111, 217, 0.2)",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={social.src}
                    alt={social.alt}
                    sx={{ width: 20, height: 20 }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

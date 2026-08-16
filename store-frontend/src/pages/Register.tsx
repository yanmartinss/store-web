import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTheme } from "@mui/material/styles";
import api from "../services/api";
import { getErrorMessage } from "../utils/get-error-message";
import { useAuthStore } from "../store/auth";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const theme = useTheme();
  const logo =
    theme.palette.mode === "dark"
      ? "/assets/ui/logo-white.png"
      : "/assets/ui/logo-black.png";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  // this page shouldn't scroll — it's meant to fit the viewport like a
  // focused auth screen, not a regular scrollable page
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const registerRes = await api.post<{ error: string | null }>(
        "/user/register",
        { name, email, password },
      );
      if (registerRes.data.error) {
        setError(registerRes.data.error);
        return;
      }

      const loginRes = await api.post<{ error: string | null }>("/user/login", {
        email,
        password,
      });
      if (loginRes.data.error) {
        // account was created but auto-login failed; send them to log in manually
        navigate("/login", { state: { from } });
        return;
      }

      setAuthenticated(true);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível criar a conta."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        gap: 2,
        p: 2,
      }}
    >
      <Tooltip title="Fechar">
        <IconButton
          component={RouterLink}
          to="/"
          aria-label="Fechar"
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>

      <RouterLink to="/" style={{ lineHeight: 0 }}>
        <Box
          component="img"
          src={logo}
          alt="Logo da loja"
          sx={{ height: 40 }}
        />
      </RouterLink>

      <Typography variant="h4" sx={{ fontWeight: 600, fontSize: "40px" }}>
        Crie a sua conta
      </Typography>

      <Typography variant="h5" sx={{ color: "gray", fontSize: "16px" }}>
        Insira seus dados e crie sua conta
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: 360,
        }}
      >
        <TextField
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Senha"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <IconButton
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "#1640c7" } }}
        >
          Criar conta
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Já tem uma conta?{" "}
        <Link component={RouterLink} to="/login" underline="hover">
          Entrar
        </Link>
      </Typography>
    </Box>
  );
}

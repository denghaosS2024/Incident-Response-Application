import { Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  // Redirect to home page after 3 seconds
  // and update the countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h2" component="h1" fontWeight="bold">
          404 - Not Found
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          The page you are looking for does not exist.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            color: "primary.main",
            fontWeight: "medium",
            padding: 1.5,
            borderRadius: 1,
            backgroundColor: "rgba(25, 118, 210, 0.08)",
            animation: "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 0.6 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.6 },
            },
          }}
        >
          Redirecting to home page in {countdown} second
          {countdown !== 1 ? "s" : ""}...
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFoundPage;

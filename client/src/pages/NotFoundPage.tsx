// This is a simple 404 Not Found page

import { Box, Container, Typography } from "@mui/material";

const NotFoundPage = () => {
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
      </Box>
    </Container>
  );
};

export default NotFoundPage;

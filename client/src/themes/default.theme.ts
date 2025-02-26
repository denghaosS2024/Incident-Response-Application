
import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
        },
    },
});

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
        },
    },
});
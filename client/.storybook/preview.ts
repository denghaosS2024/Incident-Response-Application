import type { Preview } from '@storybook/react';
import { withRouter } from 'storybook-addon-remix-react-router';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';

import '@fontsource/material-icons';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import { darkTheme, lightTheme } from '../src/themes/default.theme';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withRouter, withThemeFromJSXProvider({
    GlobalStyles: CssBaseline,
    Provider: ThemeProvider,
    themes: {
      // Provide your custom themes here
      light: lightTheme,
      dark: darkTheme,
    },
    defaultTheme: 'light',
  })],
}

export default preview

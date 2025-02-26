import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './app/store'

import './styles/index.css'

// LaunchDarkly for feature management
import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';

(async () => {
  const LDProvider = await asyncWithLDProvider({
    clientSideID: process.env.REACT_APP_LAUNCHDARKLY_SDK_KEY as string,
  });

  const domNode = document.getElementById('root') as HTMLElement
  const root = createRoot(domNode)

  root.render(
    <LDProvider>
      <Provider store={store}>
        <App />
      </Provider>,
    </LDProvider>

  )
})();
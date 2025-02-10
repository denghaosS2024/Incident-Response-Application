import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './app/store'

import './styles/index.css'

const domNode = document.getElementById('root') as HTMLElement
const root = createRoot(domNode)

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
)

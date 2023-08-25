import ReactDOM from 'react-dom/client'
import { App } from '@/components'

import './index.css'

const rootElement = document.getElementById('root');
if (rootElement !== null && rootElement.childNodes.length === 0) {
    ReactDOM.createRoot(rootElement).render(
        <App />
    )
}

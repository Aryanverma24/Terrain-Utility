
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { Route, RouterProvider , createRoutesFromElements } from 'react-router'
import { createBrowserRouter} from "react-router-dom"
import { Provider } from 'react-redux'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />} >
      
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)

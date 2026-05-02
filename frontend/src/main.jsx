import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { UserContextProvider } from './context/UserContext.jsx'
import { CourseContextProvider } from './context/CourseContext.jsx';
import { AdminContextProvider } from './context/AdminContext.jsx';
export const server = import.meta.env.VITE_API_URL;
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <CourseContextProvider>
        <AdminContextProvider>
          <App />
        </AdminContextProvider>
      </CourseContextProvider>
    </UserContextProvider>
  </StrictMode>,
)

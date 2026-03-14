import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Toaster position="top-right" />
                <RouterProvider router={router} />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

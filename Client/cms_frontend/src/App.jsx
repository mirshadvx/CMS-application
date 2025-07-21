import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserRoutes from "./routes/user/userRoutes";
import { Toaster } from "sonner";

function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: "#333",
                        color: "#fff",
                    },
                }}
            />
            <Routes>
                {UserRoutes()}
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
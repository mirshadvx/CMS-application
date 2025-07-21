import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserRoutes from "./routes/user/userRoutes";
import { Toaster } from "sonner";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchUserDetails } from "./services/userAction";

function App() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchUserDetails());
    }, [dispatch]);
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

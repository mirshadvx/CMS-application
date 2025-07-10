// import Login from "./Components/user/auth/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import auth from "./routes/user/auth";
import UserRoutes from "./routes/user/userRoutes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
               {/* {auth()} */}
               {UserRoutes()}
               <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

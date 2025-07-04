import axios from "axios";
const isDev = import.meta.env.VITE_DEBUG === "true";

const api = axios.create({
    baseURL: isDev ? "http://localhost:8000/api/v1/" : import.meta.env.VITE_BACKEND_ADDRESS,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

const authAPI = {
    login: (credentials) => api.post("auth/token/", credentials),
    refreshToken: () => api.post("auth/token/refresh/"),
    logout: () => api.post("auth/logout/"),
    isAuthenticated: () => api.get("auth/authenticated/"),
    register: (credentials) => api.post("auth/register/", credentials),
};


export { authAPI };
export default api;


// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;

//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             try {
//                 const refreshResponse = await authAPI.refreshToken();
//                 if (refreshResponse.data.refreshtoken) {
//                     console.log("Token refreshed successfully");
//                     return api(originalRequest);
//                 }
//             } catch (refreshError) {
//                 console.error("Refresh token failed:", refreshError);
//                 if (dispatch) {
//                     dispatch({ type: "user/setAuthenticated", payload: false });
//                 }
//                 window.location.href = "/login";
//                 return Promise.reject(refreshError);
//             }
//         }

//         return Promise.reject(error);
//     }
// );

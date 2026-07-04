import { setUser, setAuthenticated, logoutReducer } from '../store/userSlice';
import api from '../services/api';

export const fetchUserDetails = () => async (dispatch) => {
    try {
        const response = await api.get('auth/user-details/');
        dispatch(setUser(response.data));
        dispatch(setAuthenticated(true));
    } catch (error) {
        console.error('Failed to fetch user details:', error);
        dispatch(logoutReducer());
    }
};

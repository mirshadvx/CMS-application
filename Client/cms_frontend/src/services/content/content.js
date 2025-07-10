import api from "../api";

const contentApi = {
    getCategories: async () => {
        const response = await api.get("user/content-categories/");
        return response;
    },
};

export default contentApi;
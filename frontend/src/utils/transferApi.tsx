import axios from "axios";
import api from "../utils/api";

export const getAllTransferences = async () => {
    const response = await axios.get(`${api}/product-transfer`);
    return response.data;
};

import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext()

const AppContextProvider = (props) =>{
    const navigate = useNavigate();
    const [user,setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [token,setToken] = useState(localStorage.getItem("token"));

    const [credit, setCredit] = useState(null);

    
    const generateImage = async (prompt) => {
        try {
            const { data } = await axios.post(backendURL + '/api/image/generate', {prompt}, {headers:{token: localStorage.getItem("token")}});
            if(data.success){
                loadUserCredit(); // Reload user credit after image generation
                console.log("Image generated successfully:", data.resultImage);
                return data.resultImage;
            }
        } catch (error) {
            toast.error("Error generating image:", error);
            // Handle error appropriately, e.g., show a toast notification
            loadUserCredit(); // Reload user credit in case of error
            if(credit === 0){
                navigate('/buy')
            }
        }
    }

    const loadUserCredit = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("Loading user credit with token:", token);
            
            const { data } = await axios.post(
    backendURL + '/api/user/credits',
    {}, // no body needed here
    { headers: { token } }
);
            console.log(data);
            
            if (data) {
                setCredit(data.creditBalance);
            }
            console.log("Credit var:" + credit);
            
        } catch (error) {
            toast.error("Error loading user credit:", error);
        }
    }

    const value = {
        user, setUser, showLogin, setShowLogin, backendURL,
        token, setToken, credit, setCredit, generateImage, loadUserCredit
    }


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;
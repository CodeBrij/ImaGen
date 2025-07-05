import jsonwebtoken from 'jsonwebtoken';

export const userAuth = async (req, res, next) => {
    try {
        const {token} = req.headers;
        console.log("Token received:", token);
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        try {
            const tokenDecoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
            console.log("Token decoded:", tokenDecoded);
            if(tokenDecoded.id){
                req.body.userID = tokenDecoded.id;
                console.log("User ID set in request body:", req.body.userID);
            } else {
                return res.status(401).json({ message: "Invalid token" });
            }
        } catch (error) {
            return res.status(401).json({ message: "Invalid token" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
    
}

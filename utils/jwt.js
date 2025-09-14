import jwt from "jsonwebtoken";


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "my_access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "my_refresh_secret";

// access token อายุสั้น เช่น 2 นาที
export function generateAccessToken(user) {
    console.log(user);

    return jwt.sign(
        { USER_ID: user.USER_ID, USERNAME: user.USERNAME },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "2m" }
    );
}

// refresh token อายุยาวกว่า เช่น 5 นาที
export function generateRefreshToken(user) {
    console.log(user);
    return jwt.sign(
        { USER_ID: user.USER_ID },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "5m" }
    );
}



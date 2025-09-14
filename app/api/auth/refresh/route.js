import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/utils/jwt";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "my_refresh_secret";

export async function POST(request) {
    try {
        const body = await request.json(); // { refresh_token }
        const { refresh_token } = body;

        if (!refresh_token) {
            return NextResponse.json({ success: false, message: "No refresh token" }, { status: 400 });
        }

        // ✅ verify refresh token
        jwt.verify(refresh_token, REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                return NextResponse.json({ success: false, message: "Invalid refresh token" }, { status: 403 });
            }

            // สร้าง access token ใหม่
            const access_token = generateAccessToken(user);

            return NextResponse.json({
                success: true,
                access_token,
            });
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

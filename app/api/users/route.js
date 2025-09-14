import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";


export async function GET(request) {
    const promisePool = mysqlPool.promise()
    const [rows, fields] = await promisePool.query(
        `SELECT * FROM USERS;`
    )
    return NextResponse.json(rows)
}


export async function POST(request) {
    try {
        const body = await request.json(); // รับ JSON { username, password }
        const { username, password } = body;
        const promisePool = mysqlPool.promise();
        const [rows] = await promisePool.query(
            `SELECT * FROM USERS WHERE USERNAME = ? AND PASSWORD = ?`,
            [username, password]
        );
        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
        }
        // login สำเร็จ
        const user = rows[0];

        const access_token = generateAccessToken(user);
        const refresh_token = generateRefreshToken(user);

        return NextResponse.json({
            success: true,
            user,
            access_token,
            refresh_token,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

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
        return NextResponse.json({ success: true, user: rows[0] });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
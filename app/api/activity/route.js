import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";


export async function POST(request) {
    try {
        const body = await request.json(); // รับ JSON { username, password }
        const { user_id } = body;
        const promisePool = mysqlPool.promise();
        const [rows] = await promisePool.query(
            `SELECT * FROM TASKS WHERE USER_ID = ?`,
            [user_id]
        );
        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid' }, { status: 401 });
        }
        return NextResponse.json({ success: true, activities: rows });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
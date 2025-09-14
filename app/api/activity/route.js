import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        // 1️⃣ ดึง token จาก header
        // const authHeader = request.headers.get("Authorization");
        // if (!authHeader) {
        //     return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
        // }

        // const token = authHeader.split(" ")[1]; // Bearer <token>

        // // 2️⃣ ตรวจสอบ token
        // let decoded;
        // try {
        //     decoded = jwt.verify(token, process.env.JWT_SECRET); // secret ต้องเหมือนตอน generate
        // } catch (err) {
        //     return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
        // }

        // 3️⃣ ดึง USER_ID จาก body หรือจาก decoded token
        const body = await request.json();
        const USER_ID = body.USER_ID || decoded.USER_ID;

        const promisePool = mysqlPool.promise();
        const [rows] = await promisePool.query(
            `SELECT * FROM TASKS WHERE USER_ID = ?`,
            [USER_ID]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: "No activities found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, activities: rows });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

// Update task by TASKS_ID
export async function PATCH(request) {
    // console.log(params.id);
    try {
        // console.log(params.id);

        // const TASKS_ID = params.id;
        const body = await request.json();
        const { TASK_ID, TASK_NAME, DUE_DATE, PRIORITY, COMPLETION } = body;
        const promisePool = mysqlPool.promise();

        const [result] = await promisePool.query(
            `UPDATE TASKS
                SET TASK_NAME = ?, DUE_DATE = ?, PRIORITY = ?, COMPLETION = ?, UPDATED_DATE = NOW()
            WHERE TASK_ID = ?`,
            [TASK_NAME, DUE_DATE, PRIORITY, COMPLETION, TASK_ID]
        );

        return NextResponse.json({
            success: true,
            message: "Task updated successfully",
            TASK_ID,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Failed to update task", error: error.message },
            { status: 500 }
        );
    }
}


export async function DELETE(request) {
    try {
        const body = await request.json()
        const { TASK_ID } = body;
        const promisePool = mysqlPool.promise();
        const [rows] = await promisePool.query(
            `DELETE FROM TASKS WHERE TASK_ID = ?`,
            [TASK_ID]
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

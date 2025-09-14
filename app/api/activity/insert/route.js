import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";


export async function POST(request) {
    try {
        const body = await request.json()
        const { TASK_NAME, DUE_DATE, PRIORITY, COMPLETION, USER_ID } = body;
        const promisePool = mysqlPool.promise();
        const [result] = await promisePool.query(
            `INSERT INTO TASKS (TASK_NAME, DUE_DATE, PRIORITY, COMPLETION, USER_ID, CREATED_DATE, UPDATED_DATE)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [TASK_NAME, DUE_DATE, PRIORITY, COMPLETION, USER_ID]
        );
        // result.insertId จะคืนค่า TASK_ID ใหม่ที่ถูกสร้าง
        const TASK_ID = result.insertId;

        return NextResponse.json({
            success: true,
            message: "Task created successfully",
            TASK_ID,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Failed to create task", error: error.message },
            { status: 500 }
        );
    }

}
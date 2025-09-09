import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET() {
  const promisePool = mysqlPool.promise()
  const [rows] = await promisePool.query(
    `SELECT * FROM attractions;`
  )
  return NextResponse.json(rows)
}
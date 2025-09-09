import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET({ params }) {
  const id = params.id
  const promisePool = mysqlPool.promise()
  const [rows] = await promisePool.query(
    `SELECT * FROM attractions WHERE id = ?`,
    [id]
  )
  return NextResponse.json(rows)
}
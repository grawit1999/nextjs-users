import mysql from "mysql2/promise";
export const mysqlPool = mysql.createPool(process.env.MYSQL_URI)
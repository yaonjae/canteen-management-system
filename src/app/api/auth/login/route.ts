import { createSessionToken } from "@/lib/session";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    try {
        // Try to find the user in the Admin table
        const admin = await db.admin.findUnique({
            where: { username },
        });

        if (admin) {
            const passwordMatch = password === admin.password;

            if (!passwordMatch) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            const token = createSessionToken({
                username,
                password,
                role: "admin",
                id: admin.id
            });

            const response = NextResponse.json({
                message: "Login Successful",
                user: {
                    username: admin.username,
                    role: "admin",
                    user_id: admin.id
                }
            }, { status: 200 });

            response.cookies.set("session-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/"
            });

            return response;
        }

        // Try to find the user in the Cashier table
        const cashier = await db.cashier.findUnique({
            where: { username },
        });

        if (cashier) {
            const passwordMatch = password === cashier.password;

            if (!passwordMatch) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            const token = createSessionToken({
                username,
                password,
                role: "cashier",
                id: cashier.id
            });

            const response = NextResponse.json({
                message: "Login Successful",
                user: {
                    username: cashier.username,
                    role: "cashier",
                    user_id: cashier.id
                }
            }, { status: 200 });

            response.cookies.set("session-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/"
            });

            return response;
        }

        // If user is not found in both tables
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (error) {
        console.error("An error occurred during login:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

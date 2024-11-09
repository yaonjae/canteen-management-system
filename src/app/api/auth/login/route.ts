import { createSessionToken } from "@/lib/session";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { username, password, role } = await req.json();
    
    try {
        if (role === "admin") {
            const user = await db.admin.findUnique({
                where: { username }, 
            });

            if (!user) {
                return NextResponse.json({error: "Invalid credentials"}, {status: 401});
            }

            const passwordMatch = password === user.password;

            if (!passwordMatch) {
                return NextResponse.json({error: "Invalid credentials"}, {status: 401});
            }

            const token = createSessionToken({
                username,
                password,
                role,
                id: user.id
            })
            const response = NextResponse.json({message: "Login Successful", user: { username: user.username, password: user.password, role: "admin", user_id: user.id}}, {status: 200});
            response.cookies.set('session-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            })
            return response;
        } else {

        }
    } catch (error) {
        
    }
}
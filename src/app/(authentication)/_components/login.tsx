import React from 'react'
import Image from 'next/image'
import LoginForm from './login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import loginImage from '@/app/images/cpms.jpg'

const Login = () => {
    return (
        <div className='h-screen flex justify-center items-center'>
            <div className='w-[900px] relative m-12'>
                <Card className='z-0 h-[400px] shadow-lg'>
                    <CardContent className='p-0 grid grid-cols-1 md:grid-cols-2 items-center content-center h-full'>
                        <LoginForm />
                        <Image src={loginImage} alt="Login" className='md:block hidden object-cover' />
                    </CardContent>
                </Card>
                <div className='rounded-full bg-[#2762eb] size-14 absolute -top-7 -left-7 z-[-1] shadow-lg'></div>
                <div className='rounded-full bg-orange-400 size-14 absolute -bottom-7 -right-7 z-[-1] shadow-lg'></div>
            </div>
        </div>
    )
}

export default Login

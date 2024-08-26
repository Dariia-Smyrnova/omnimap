"use client";
import { SignIn, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import colors from 'tailwindcss/colors'

// import BrandLogo from ''

const Login = () => {
    const { isLoaded, isSignedIn } = useUser();

    console.log(isLoaded, isSignedIn);

    if (isLoaded && isSignedIn) redirect('/')

    return (
        <div className="grid h-screen grid-cols-8 overflow-hidden">
            <div
                className="col-span-5 overflow-hidden"
                style={{
                    backgroundImage: "url('https://placeimg.com/1000/1000/nature/grayscale')",
                    backgroundSize: 'cover',
                }}
            ></div>

            <div className="col-span-3 px-12 py-12">
                {/* <BrandLogo className="mx-auto w-96" /> */}
                <p className="mt-2 text-center">
                    Gain immediate access to thousands of news articles from around the world.
                </p>
                <h2 className="mb-8 mt-12 text-2xl font-bold">Sign In</h2>
                <div className="mb-8">
                    <SignIn
                        appearance={{
                            variables: { colorPrimary: colors.red[600] },
                            elements: { rootBox: 'mx-auto' },
                        }}
                    />
                </div>
                <Link href="/" className="block text-center text-sm text-gray-500 underline">
                    Go Back Home
                </Link>
            </div>
        </div>
    )
}

export default Login
import React from 'react'

const CardLoader = () => {
    return (
        <div>
            <div
                className="flex flex-col bg-neutral-200 w-56 h-96 animate-pulse rounded-xl p-4 gap-4"
            >
                <div className="bg-neutral-400/50 w-full h-60 animate-pulse rounded-md"></div>
                <div className="flex flex-col justify-between h-full">
                    <div className='flex flex-col gap-4'>
                        <div className="bg-neutral-400/50 w-full h-4 animate-pulse rounded-md"></div>
                        <div className="bg-neutral-400/50 w-4/5 h-4 animate-pulse rounded-md"></div>
                        <div className="bg-neutral-400/50 w-2/4 h-4 animate-pulse rounded-md"></div>
                        <div className="bg-neutral-400/50 w-1/4 h-4 animate-pulse rounded-md"></div>
                        <div className="bg-neutral-400/50 w-full h-4 animate-pulse rounded-md"></div>
                    </div>
                    <div className='flex gap-2'>
                        <div className="bg-neutral-400/50 size-10 animate-pulse rounded-md"></div>
                        <div className="bg-neutral-400/50 size-10 animate-pulse rounded-md"></div>
                        <div className="bg-neutral-400/50 size-10 animate-pulse rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardLoader

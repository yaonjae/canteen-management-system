import React from 'react'

const CardLoaderCashier = () => {
    return (
        <div>
            <div
                className="flex flex-col bg-neutral-200 size-48 animate-pulse rounded-xl p-4 gap-4"
            >
                <div className="bg-neutral-400/50 w-full h-60 animate-pulse rounded-md"></div>
                <div className="bg-neutral-400/50 w-full h-4 animate-pulse rounded-md"></div>
            </div>
        </div>
    )
}

export default CardLoaderCashier

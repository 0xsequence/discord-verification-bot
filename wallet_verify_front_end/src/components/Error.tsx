import React from 'react';

export default function Error() {
    return (
        <div className="w-full max-w-md">
            <main className="">
                <div className="text-8xl pb-2 font-bold text-white text-center uppercase">Error</div>
                <div>
                    <h2 className="text-2xl py-4 text-center text-gray">
                        Your verification token is invalid or has expired. Please return to Discord and get a new link
                        to verify your wallet.
                    </h2>
                </div>
            </main>
        </div>
    );
}

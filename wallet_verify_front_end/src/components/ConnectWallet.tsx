'use client';

import Message from './Message';
import LoginButton from '@/components/LoginButton';
import {sequence} from '0xsequence';
import {ConnectDetails, ConnectOptions} from '@0xsequence/provider';
import {SequenceConnectResult} from '@/interfaces/sequence-connect-result';
import {ResultMessage} from '@/interfaces/result-message';

import axios from 'axios';
import React, {SyntheticEvent, useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';

import {globalLogger as logger} from '@/types/global_logger';

export default function ConnectWallet() {
    const searchParams = useSearchParams();
    const [resultMessage, setResultMessage] = useState<ResultMessage>();
    const [token, setToken] = useState<string | null>();

    useEffect(() => {
        const tokenValue = searchParams.get('token');
        setToken(tokenValue);
    }, [searchParams]);

    const setSuccessMessage = (message: string | undefined) => {
        setResultMessage((prevState) => {
            const result: ResultMessage = {
                ...prevState,
                Summary: message ?? 'Finalising wallet verification! You can close this page now.',
                Detail: 'You will receive a final confirmation in Discord. \nThis can take up to 5 minutes.',
                IsSuccess: true,
            };

            return result as ResultMessage;
        });
    };

    const setErrorMessage = (message: string | undefined) => {
        setResultMessage((prevState) => {
            const result: ResultMessage = {
                ...prevState,
                Summary: message ?? 'Finalising wallet verification! You can close this page now.',
                Detail: 'You will receive a final confirmation in Discord. \nThis can take up to 5 minutes.',
                IsSuccess: false,
            };

            return result;
        });
    };

    const handleConnect = async (e: SyntheticEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setResultMessage(undefined);
        
        try {
            const body = {
                token: token,
            };
            const axiosResponse = await axios.post('/api/verify_token', body);
            const tokenPayload =  axiosResponse.data.tokenPayload ?? null;

            const sequenceConnectResult = await sequenceAuthenticate();
            if (sequenceConnectResult == null) {
                setErrorMessage('Failed to connect your wallet, please try again');
                return;
            }

            if (sequenceConnectResult.Address) {
                // Call to connect.ts
                const body = {
                    walletConnDetails: sequenceConnectResult,
                    tokenPayload: tokenPayload,
                };
                const { data } = await axios.post('/api/connect', body);
                setSuccessMessage(data.message);
            }

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                logger.error(`Request failed - status code: ${error.response?.status} - ${error.response?.data}`);
                setErrorMessage(error?.response?.data.message);
                return;
            }
            logger.error(error);
            setErrorMessage('There was an error connecting your wallet. Please try again');
            return;
        }
    };

    const sequenceAuthenticate = async () => {
        const network = process.env.NETWORK;

        await sequence.initWallet(network);
        const wallet = sequence.getWallet();

        // Pass authorize: true to the connect() function, which will automatically have the user sign a EIP712 signed message to prove their identity.
        // This allows you to then easily authenticate the connected wallet address with absolutely certainty.
        // See https://docs.sequence.xyz/sdk/typescript/guides/connect-wallet/#wallet-login-and-connect-options
        const connectOptions: ConnectOptions = {
            app: process.env.NEXT_PUBLIC_CONNECT_WALLET_SEQUENCE_APP_NAME,
            askForEmail: true,
            authorize: true,
            settings: {
                theme: process.env.NEXT_PUBLIC_CONNECT_WALLET_SEQUENCE_THEME,
                bannerUrl: process.env.NEXT_PUBLIC_CONNECT_WALLET_SEQUENCE_BANNER_URL,
                signInOptions: ['google', 'discord', 'facebook', 'twitch', 'email'],
            },
        };

        const connectDetails: ConnectDetails = await wallet.connect(connectOptions);

        if (connectDetails?.connected) {
            const address = await wallet.getAddress();
            const email = connectDetails.email;
            // https://docs.sequence.xyz/wallet/guides/auth-address/#authenticate-wallet
            const signature = connectDetails.proof?.proofString;

            const connectResult: SequenceConnectResult = { Address: address, Email: email, Signature: signature };
            return connectResult;
        }
    };

    const mainMsg = process.env.NEXT_PUBLIC_CONNECT_WALLET_MAIN_MESSAGE
        ?? 'Please log into the wallet that contains your NFT to verify ownership and get the associated perks on Discord';
    return (
        <div className="w-full max-w-md mt-16 sm:mt-0">
            <main className="p-4">
                <div className="text-8xl pb-2 font-bold text-white text-center uppercase">Login</div>
                <div className="bg-black bg-opacity-70 border border-solid border-darkgray">
                    <h2 className="text-2xl py-4 px-2 text-center text-gray">{mainMsg}</h2>
                </div>
                <div className="py-8 px-2">
                    <LoginButton handleOnClick={handleConnect} />
                </div>
                <div className="px-2 mt-0 h-24">{resultMessage && <Message message={resultMessage}/>}</div>
            </main>
        </div>
    );
}

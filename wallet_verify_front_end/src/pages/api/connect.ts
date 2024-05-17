import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from '@/clients/sns_client';
import { SequenceConnectResult } from '@/interfaces/sequence-connect-result';
import { WalletVerification } from '@0xsequence/wallet-utils';

import { JsonWebTokenError, JwtPayload, verify } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

import { globalLogger as logger } from '@/types/global_logger';

export default async function connect(req: NextApiRequest, res: NextApiResponse) {
    logger.info(`Attempting to connect wallet`);
    const { walletConnDetails, token } = req.body;

    try {
        // this needs to be the same as the bot's JWT_SECRET
        const secret = process.env.JWT_SECRET;
        const tokenPayload = verify(token, secret ?? '');
        logger.debug(tokenPayload);

        await sendToSns(walletConnDetails, tokenPayload as JwtPayload); // TODO: fix
    } catch (err) {
        logger.error(err);

        if (err instanceof JsonWebTokenError) {
            res.status(500).json({
                message:
                    'Your verification token is invalid or has expired. Please restart the account linking process in Discord',
            });
        } else {
            res.status(500).json({
                message: 'The verification has failed.',
            });
        }
        return;
    }

    res.status(200).json({ message: '' });
    res.end();
}

async function sendToSns(walletConnDetails: SequenceConnectResult, tokenPayload: JwtPayload) {
    const topicARN = process.env.WALLET_VERIFIED_TOPIC_ARN;
    logger.info('Sending wallet verified event to SNS topic ', topicARN);
    logger.debug(`JwtPayload: ${JSON.stringify(tokenPayload)}`);

    const message: WalletVerification = {
        UserId: tokenPayload.UserId,
        ThreadId: tokenPayload.ThreadId,
        UserName: tokenPayload.UserName,
        WalletAddress: walletConnDetails.Address,
        Email: walletConnDetails.Email ?? '',
        Signature: walletConnDetails.Signature ?? '',
    };

    const params = {
        Message: JSON.stringify(message),
        TopicArn: topicARN,
    };

    const publishCommand = new PublishCommand(params);

    try {
        await snsClient.send(publishCommand);
    } catch (err) {
        logger.error(`Error sending message to SNS topic: ${topicARN} - `, err);
    }
}

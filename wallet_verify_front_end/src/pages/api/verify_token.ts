import {NextApiRequest, NextApiResponse} from 'next';
import {JsonWebTokenError, TokenExpiredError, verify} from 'jsonwebtoken';
import {globalLogger as logger} from "@/types/global_logger";

export default function verifyToken(req: NextApiRequest, res: NextApiResponse) {
    logger.info('Verifying Discord security token')
    const { token } = req.body;

    try {
        // this has to be same as the bot's JWT_SECRET
        const tokenPayload = verify(token, process.env.JWT_SECRET);
        return res.status(200).send({ message: 'Token verified', tokenPayload });

    } catch (err: unknown) {
        if (err instanceof TokenExpiredError || err instanceof  JsonWebTokenError) {
            return res.status(401).json({ message: 'Your verification token is invalid or has expired. Please restart the linking process in Discord' });
        } else{
            return res.status(500).json({message: 'The verification has failed.'});
        }
    }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { TokenExpiredError, verify } from 'jsonwebtoken';

export default function verifyToken(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.body;

    try {
        // this has to be same as the bot's JWT_SECRET
        const secret = process.env.JWT_SECRET;
        verify(token, secret ?? '');
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            res.status(500).json({ message: 'The verification has timed out.' });
        } else {
            res.status(500).json({
                message: 'The verification has failed.',
            });
        }
        return;
    }

    res.status(200).json({ message: 'Token verified' });
    res.end();
}

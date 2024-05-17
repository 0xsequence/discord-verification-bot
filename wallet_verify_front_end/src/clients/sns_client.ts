import { SNSClient } from '@aws-sdk/client-sns';

const region = process.env.REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const snsClient = new SNSClient({
    region: region,
    credentials: {
        accessKeyId: accessKey ?? '',
        secretAccessKey: secretAccessKey ?? '',
    },
});

export { snsClient };

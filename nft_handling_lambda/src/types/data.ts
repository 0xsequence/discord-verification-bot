import { Nft } from '@0xsequence/discord-bot-wallet-utils';

export class Data {
    public Nft: Nft;
    public FromWallet: string | undefined;

    constructor(nft: Nft, fromWallet: string | undefined) {
        this.Nft = nft;
        this.FromWallet = fromWallet;
    }
}

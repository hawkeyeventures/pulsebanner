import { getAccounts } from '../../../../util/getAccounts';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import NextCors from 'nextjs-cors';
import axios from 'axios';
import { ClientCredentialsAuthProvider } from 'twitch-auth';
import { Account } from '@prisma/client';
import { GetSubscriptionsResponse } from '../twitch';

const authProvider = new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const session = await getSession({ req });

    if (session) {
        const accounts = await getAccounts(session);
        const twitchAccount: Account = accounts['twitch'];

        const token = await authProvider.getAccessToken();

        const response = await axios.get<GetSubscriptionsResponse>('https://api.twitch.tv/helix/eventsub/subscriptions', {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${token.accessToken}`,
            },
        });
        const allSubscriptions = response.data.data;
        const userSubscriptions = allSubscriptions.filter((subscription) => subscription.condition.broadcaster_user_id === twitchAccount.providerAccountId);

        if (req.method === 'GET') {
            if (session.user['role'] === 'admin') {
                res.status(200).json({ subscriptions: allSubscriptions });
            } else {
                res.status(200).json({ subscriptions: userSubscriptions });
            }
        } else if (req.method === 'DELETE') {
            userSubscriptions.forEach(async (webhook) => {
                await axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${webhook.id}`, {
                    headers: {
                        'Client-ID': process.env.TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${token.accessToken}`,
                    },
                });
            });
            res.send(200);
        }
    } else {
        console.log('this failed');
        res.send(401);
    }
}

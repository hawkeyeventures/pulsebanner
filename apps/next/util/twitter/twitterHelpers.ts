import { TwitterClient } from 'twitter-api-client';

export type TwitterResponseCode = 200 | 400;

export const createTwitterClient = (oauth_token: string, oauth_token_secret: string): TwitterClient => {
    return new TwitterClient({
        apiKey: process.env.TWITTER_ID,
        apiSecret: process.env.TWITTER_SECRET,
        accessToken: oauth_token,
        accessTokenSecret: oauth_token_secret,
    });
};

export async function getBanner(oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    let imageUrl: string = undefined;
    try {
        const response = await client.accountsAndUsers.usersProfileBanner({
            user_id: providerAccountId,
        });
        imageUrl = response.sizes['1500x500'].url;
        console.log('imageUrl: ', imageUrl);
    } catch (e) {
        console.log('User does not have a banner setup. Will save empty for later: ', e);
        imageUrl = 'empty';
    }

    return imageUrl;
}

// pass it the banner so we can just upload the base64 or image url directly
export async function updateBanner(oauth_token: string, oauth_token_secret: string, bannerBase64: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    // We store empty string if user did not have an existing banner
    if (bannerBase64 === 'empty') {
        try {
            await client.accountsAndUsers.accountRemoveProfileBanner();
        } catch (e) {
            console.log('error: ', e);
            return 400;
        }
    } else {
        try {
            await client.accountsAndUsers.accountUpdateProfileBanner({
                banner: bannerBase64,
            });
        } catch (e) {
            if ('errors' in e) {
                // Twitter API error
                if (e.errors[0].code === 88)
                    // rate limit exceeded
                    console.log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));
                // some other kind of error, e.g. read-only API trying to POST
                else console.log('Other error');
            } else {
                // non-API error, e.g. network problem or invalid JSON in response
                console.log('Non api error');
            }
            console.log('failed to update banner');
            return 400;
        }
    }
    console.log('success updating banner');
    return 200;
}

// pass in the twitch url here that we will get from somewhere the user uploads it (TBD)
export async function tweetStreamStatusLive(oauth_token: string, oauth_token_secret: string, streamLink?: string, tweetContent?: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `I am live! Come join the stream on twitch! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        // there could be a problem with how long the string is
        console.log('error with publishing the tweet: ', e);
        return 400;
    }
    return 200;
}

export async function tweetStreamStatusOffline(oauth_token: string, oauth_token_secret: string, streamLink?: string, tweetContent?: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `Thanks for watching! I will be live again soon! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        // there could be a problem with how long the string is
        console.log('error with publishing the tweet: ', e);
        return 400;
    }
    return 200;
}

export async function getCurrentTwitterName(oauth_token: string, oauth_token_secret: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        const account = await client.accountsAndUsers.accountVerifyCredentials();
        const name = account.name;
        return name;
    } catch (e) {
        console.log('Errror getting twitter name: ', e);
        return '';
    }
}

export async function updateTwitterName(oauth_token: string, oauth_token_secret: string, name: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.accountsAndUsers.accountUpdateProfile({ name: name });
    } catch (e) {
        console.log('error updating twitter name: ', e);
        return 400;
    }
    return 200;
}

export async function getTwitterProfilePic(oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        const response = await client.accountsAndUsers.usersShow({ user_id: providerAccountId });
        const profilePic = response.profile_image_url_https;
        return profilePic;
    } catch (e) {
        console.log('error getting twitter profile pic, setting to empty: ', e);
        return 'empty';
    }
}

export async function updateProfilePic(oauth_token: string, oauth_token_secret: string, profilePicBase64: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    // this will only be hit or used on streamdown.See if we even need this by changing to user? Not sure how to test this really
    if (profilePicBase64 === 'empty') {
        try {
            await client.accountsAndUsers.accountUpdateProfileImage({
                image: profilePicBase64,
            });
        } catch (e) {
            console.log('Error updating empty profile image: ', e);
        }
    } else {
        try {
            await client.accountsAndUsers.accountUpdateProfileImage({
                image: profilePicBase64,
            });
        } catch (e) {
            if ('errors' in e) {
                // Twitter API error
                if (e.errors[0].code === 88)
                    // rate limit exceeded
                    console.log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));
                // some other kind of error, e.g. read-only API trying to POST
                else console.log('Other error');
            } else {
                // non-API error, e.g. network problem or invalid JSON in response
                console.log('Non api error');
            }
            console.log('failed to update profile picture');
            return 400;
        }
    }
    console.log('success updating profile picture');
    return 200;
}

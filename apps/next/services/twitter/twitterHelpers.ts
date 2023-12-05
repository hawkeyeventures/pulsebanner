import { TwitterClient, UsersLookup } from 'twitter-api-client';
import { flipFeatureEnabled } from '../postgresHelpers';
import { sendError } from '../../util/discord/sendError';
import env from '../../util/env';
import { logger } from '../../util/logger';

export type TwitterResponseCode = 200 | 400;

export const createTwitterClient = (oauth_token: string, oauth_token_secret: string): TwitterClient => {
    return new TwitterClient({
        apiKey: env.TWITTER_ID,
        apiSecret: env.TWITTER_SECRET,
        accessToken: oauth_token,
        accessTokenSecret: oauth_token_secret,
    });
};

export async function getUserInfo(userId: string, oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<UsersLookup | undefined> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    try {
        const response = await client.accountsAndUsers.accountVerifyCredentials();
        return response;
    } catch (e) {
        logger.error('Twitter API Error accountVerifyCredentials');
        return undefined;
    }
}

export async function getBanner(userId: string, oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    let imageUrl: string | undefined = undefined;
    try {
        const response = await client.accountsAndUsers.accountVerifyCredentials();
        // const response = await client.accountsAndUsers.usersProfileBanner({
        //     user_id: providerAccountId,
        // }); 
        // imageUrl = response.sizes['1500x500'].url;
        imageUrl = response.profile_banner_url;
        logger.log('Fetched Twitter banner', { url: imageUrl, userId });
    } catch (e) {
        logger.error('Twitter API Error usersProfileBanner');
        logger.info('User does not have a banner setup. Will save empty for later', { userId });
        imageUrl = 'empty';
    }

    return imageUrl;
}

// pass it the banner so we can just upload the base64 or image url directly
export async function updateBanner(userId: string, oauth_token: string, oauth_token_secret: string, bannerBase64: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    // We store empty string if user did not have an existing banner
    if (bannerBase64 === 'empty') {
        try {
            await client.accountsAndUsers.accountRemoveProfileBanner();
        } catch (e) {
            logger.error('Twitter API Error accountRemoveProfileBanner');
            handleTwitterApiError(userId, e as any, 'Removing empty banner to update banner');
            return 400;
        }
    } else {
        try {
            await client.accountsAndUsers.accountUpdateProfileBanner({
                banner: bannerBase64,
            });
        } catch (e) {
            logger.error('Twitter API Error:', e);
            handleTwitterApiError(userId, e as any, 'Updating banner');
            return 400;
        }
    }
    logger.info('Successfully updated banner', { userId });
    return 200;
}

// pass in the twitch url here that we will get from somewhere the user uploads it (TBD)
export async function tweetStreamStatusLive(
    userId: string,
    oauth_token: string,
    oauth_token_secret: string,
    streamLink?: string,
    tweetContent?: string
): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `I am live! Come join the stream on twitch! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        logger.error('Twitter API Error statusesUpdate');
        // there could be a problem with how long the string is
        handleTwitterApiError(userId, e as any, 'Publishing tweet');
        return 400;
    }
    return 200;
}

export async function tweetStreamStatusOffline(
    userId: string,
    oauth_token: string,
    oauth_token_secret: string,
    streamLink?: string,
    tweetContent?: string
): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `Thanks for watching! I will be live again soon! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        logger.error('Twitter API Error statusesUpdate');
        // there could be a problem with how long the string is
        handleTwitterApiError(userId, e as any, 'Publishing tweet');
        return 400;
    }
    return 200;
}

export async function getCurrentTwitterName(userId: string, oauth_token: string, oauth_token_secret: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        const account = await client.accountsAndUsers.accountVerifyCredentials();
        const name = account.name;
        return name;
    } catch (e) {
        logger.error('Twitter API Error accountVerifyCredentials');
        handleTwitterApiError(userId, e as any, 'Get current twitter name');
        return '';
    }
}

export async function updateTwitterName(userId: string, oauth_token: string, oauth_token_secret: string, name: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    try {
        await client.accountsAndUsers.accountUpdateProfile({ name: name });
    } catch (e) { 
        logger.error('Twitter API Error accountUpdateProfile');
        logger.error('Failed to update twitter name', e);
        await handleTwitterApiError(userId, e as any, 'Updating Twitter name');
        return 400;
    }
    return 200;
}

export async function getTwitterProfilePic(userId: string, oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        // const response = await client.accountsAndUsers.usersShow({ user_id: providerAccountId });
        const response = await client.accountsAndUsers.accountVerifyCredentials();
        // https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/user-profile-images-and-banners
        // remove '_normal' to get the original sized profile image
        const profilePic = response.profile_image_url_https.replace('_normal', '');
        return profilePic;
    } catch (e) {
        logger.error('Twitter API Error accountVerifyCredentials');
        handleTwitterApiError(userId, e as any, 'error getting twitter profile pic, setting to empty');
        return 'empty';
    }
}

export async function updateProfilePic(userId: string, oauth_token: string, oauth_token_secret: string, profilePicBase64: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    // this will only be hit or used on streamdown.See if we even need this by changing to user? Not sure how to test this really
    if (profilePicBase64 === 'empty') {
        try {
            await client.accountsAndUsers.accountUpdateProfileImage({
                image: profilePicBase64,
            });
        } catch (e) {
            logger.error('Twitter API Error:', e);
            logger.error('Failed to update empty profile image', e);
        }
    } else {
        try {
            await client.accountsAndUsers.accountUpdateProfileImage({
                image: profilePicBase64,
            });
        } catch (e) {
            logger.error('Twitter API Error:', e);
            handleTwitterApiError(userId, e as any, 'Updating profile picture');
            return 400;
        }
    }
    logger.info('Successfully updated profile picture', { userId });
    return 200;
}

/**
 * Verifies that we still have proper Twitter authentication
 *
 *@param oauth_token
 * @param oauth_token_secret
 * @returns
 */
export async function validateTwitterAuthentication(oauth_token: string, oauth_token_secret: string): Promise<boolean> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    // if we get a vaild response, we know they are verified and have not revoked the application. They could be still signed in at this point regardless
    try {
        await client.accountsAndUsers.accountVerifyCredentials();
    } catch (e) {
        // any failure (regardless or error code) make them re-authenticate
        logger.error('unsuccessful twitter authentication, requiring re-authentication.', e);
        return false;
    }
    return true;
}

export async function getTwitterUserLink(oauth_token: string, oauth_token_secret: string): Promise<string | null> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        const response = await client.accountsAndUsers.accountVerifyCredentials();
        const screenName = response.screen_name;
        return `https://twitter.com/${screenName}`;
    } catch (e) {
        logger.error('Twitter API Error accountVerifyCredentials');
        logger.error('Error building twitter link.', { error: e });
    }
    return null;
}

// would need to pass in the userId here
async function handleTwitterApiError(userId: string, e: { data?: { errors?: { message: string; code: number }[]; _headers?: any } }, context = '') {
    if ('data' in e) {
        if ('errors' in e) {
            const error = e.data?.errors?.[0];
            // Twitter API error
            if (!error) {
                // error is undefined
                sendError({ name: 'UndefinedTwitterError', message: 'Error is udnefined' }, `userId: ${userId}\t Context: ${context}`);
            } else if (error?.code === 88) {
                // rate limit exceeded
                logger.error(`Rate limit error, code 88. Rate limit will reset on ${new Date(e.data?._headers.get('x-rate-limit-reset') * 1000)}`, e);
                sendError({ ...error, name: 'TwitterRateLimitError' }, context);
            } else if (error.code === 89) {
                logger.error('TwitterAPIInvalidTokenError: invalid or expired token error', { userId, e, context });
                sendError({ ...error, name: 'TwitterAPIInvalidTokenError' }, `Invalid or expired token error. userId: ${userId}\t Context: ${context}`);
            } else if (error.code === 64) {
                logger.error('Account is suspended and is not permitted to interact with API. Disabling features of user', { userId, e, context });
                await flipFeatureEnabled(userId, 'banner', true);
                await flipFeatureEnabled(userId, 'name', true);
                sendError({ ...error, name: 'TwitterAccountSuspended' }, `Account is suspended. Disabled features successfully. userId: ${userId}\t Context: ${context}`);
            } else if (error.code === 120) {
                logger.error('Twitter name is too long or has invalid characters. Not able to update', { userId, e, context });
                sendError(
                    { ...error, name: 'TwitterNameInvalidOrTooLong' },
                    `Twitter name is too long or has invalid characters and unable to update. userId: ${userId}\t Context: ${context}`
                );
            } else if (error.code === 326) {
                logger.error('Twitter account is temporarily locked. Disabling features for user', { userId, e, context });
                await flipFeatureEnabled(userId, 'banner', true);
                await flipFeatureEnabled(userId, 'name', true);
                sendError({ ...error, name: 'TwitterAccountLocked' }, `Account is locked. Disabled features successfully. userId: ${userId}\t Context: ${context}`);
            }
            // some other kind of error, e.g. read-only API trying to POST
            else {
                logger.error('Other Twitter API error occurred', { userId, e, context });
                sendError(e as any, `Other Twitter API error occured. userId: ${userId}\t Context: ${context}`);
            }
        }
    } else {
        // non-API error, e.g. network problem or invalid JSON in response
        logger.error('Non Twitter API error occured', { userId, e, context });
        sendError(e as any, `Non Twitter API error occured. userId: ${userId}\t Context: ${context}`);
    }
}

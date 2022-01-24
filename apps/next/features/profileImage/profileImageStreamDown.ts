import { flipFeatureEnabled, getProfilePicEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { logger } from '@app/util/logger';
import { download } from '@app/util/s3/download';
import { TwitterResponseCode, updateProfilePic, validateTwitterAuthentication } from '@app/util/twitter/twitterHelpers';
import { env } from 'process';
import { Feature } from '../Feature';

const profileImageStreamDown: Feature<string> = async (userId: string): Promise<string> => {
    const bucketName: string = env.PROFILE_PIC_BUCKET_NAME;

    const profilePicInfo = await getProfilePicEntry(userId);

    const twitterInfo = await getTwitterInfo(userId);

    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'profileImage');
        logger.error('Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.';
    }

    if (profilePicInfo === null || twitterInfo === null) {
        logger.error('Could not find profile pic entry or twitter info for user', { userId });
        return 'Could not find profile pic entry or twitter info for user';
    }

    // get the original image from the
    // const response = await localAxios.get(`/api/storage/download/${userId}`);
    const base64Image: string | undefined = await download(bucketName, userId);

    if (base64Image === undefined) {
        logger.error('Unable to find user in database for profile picture on streamdown. This can be caused by the user enabling the feature while currently live.', { userId });
        return 'Unable to find user in database for profile pic on streamdown. This can be caused by the user enabling the feature while currently live.';
    }

    const profilePicStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
    return profilePicStatus === 200 ? 'Set profile pic back to original image' : 'Unable to set profile pic to original image';
};

export default profileImageStreamDown;

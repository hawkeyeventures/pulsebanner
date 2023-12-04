import { remotionAxios } from '@app/util/axios';
import { flipFeatureEnabled } from '@app/services/postgresHelpers';
import env from '@app/util/env';
import { logger } from '@app/util/logger';
import { getTwitterProfilePic, TwitterResponseCode, updateProfilePic, validateTwitterAuthentication } from '@app/services/twitter/twitterHelpers';
import { RenderedProfileImage, Prisma } from '@prisma/client';
import { AxiosResponse } from 'axios';
import imageToBase64 from 'image-to-base64';
import { Feature } from '../Feature';
import { S3Service } from '@app/services/S3Service';
import { AccountsService } from '@app/services/AccountsService';
import { ProfilePicService } from '@app/services/ProfilePicService';

export type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

const profileImageStreamUp: Feature<string> = async (userId: string): Promise<string> => {
    const profilePicEntry = await ProfilePicService.getProfilePicEntry(userId);
    const profilePicRendered: RenderedProfileImage | null = await  ProfilePicService.getProfilePicRendered(userId); // compare to updatedAt time and only update if later
    const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

    const validatedTwitter = twitterInfo && await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'profileImage');
        logger.error('Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.';
    }

    if (profilePicEntry === null || twitterInfo === null) {
        logger.error('Unable to get profilePicEntry or twitterInfo for user on streamup', { userId });
        return 'Unable to get profilePicEntry or twitterInfo for user on streamup';
    }

    // profile pic bucket name
    const profilePicBucketName: string = env.PROFILE_PIC_BUCKET_NAME;
    const profilePicCacheBucketName: string = env.PROFILE_PIC_CACHE_BUCKET;

    // get the existing profile pic
    const profilePicUrl: string = await getTwitterProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

    //upload profilePicUrl as base64 to s3 storage
    let dataToUpload: string;

    try {
        dataToUpload = profilePicUrl === 'empty' ? 'empty' : await imageToBase64(profilePicUrl);
    } catch (error) {
        // Handle the error appropriately
        logger.error('Error converting profile picture to base64', { error, profilePicUrl });
        dataToUpload = 'error'; // Or handle this situation with a default value or specific logic
    }

    try {
        await S3Service.uploadBase64(profilePicBucketName, userId, dataToUpload);
    } catch (e) {
        logger.error('Error uploading original profile picture to S3.');
        return 'Error uploading original banner to S3.';
    }

    // check here if we have previously rendered the profile picture. Update if they have saved more recent than what we have saved in the render time

    // if we do not have the image in s3, we also need to remove it
    const cachedImage: string | undefined = await S3Service.download(profilePicCacheBucketName, userId);

    // if we do not have anything stored for the current profilePicRendered, do not have a cachedImage, or have updated the settings recently, re-render
    if (profilePicRendered === null || cachedImage === undefined || Date.parse(profilePicRendered.lastRendered.toString()) < Date.parse(profilePicEntry.updatedAt.toString())) {
        if (profilePicRendered === null || cachedImage === undefined) {
            logger.info('Cache miss: Rendering profile image for the first time.', { userId });
        } else {
            logger.info('Cache miss: Rendering profile picture cached image has been invalidated.', { userId });
        }

        const profilePicUrl: string = await getTwitterProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

        const templateObj: TemplateRequestBody = {
            backgroundId: profilePicEntry.backgroundId ?? 'CSSBackground',
            foregroundId: profilePicEntry.foregroundId ?? 'ProfilePic',
            foregroundProps: { ...(profilePicEntry.foregroundProps as Prisma.JsonObject), imageUrl: profilePicUrl } ?? {},
            backgroundProps: (profilePicEntry.backgroundProps as Prisma.JsonObject) ?? {},
        };

        const response: AxiosResponse<string> = await remotionAxios.post('/getProfilePic', templateObj);
        const base64Image: string = response.data;

        const profilePictureStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
        // update the last render time table and upload this image to s3
        if (profilePictureStatus === 200) {
            await ProfilePicService.updateProfilePicRenderedDB(userId);
            await S3Service.uploadBase64(profilePicCacheBucketName, userId, base64Image);
        }

        return profilePictureStatus === 200 ? 'Set profile picture to given template.' : 'Unable to set profile picture.';
    } else {
        logger.info('Cache hit: not re-rendering profile image.');
    }

    // otherwise, update the profilePicture with the cachedImage
    logger.info('Image is valid, updating from cache');
    const profilePictureStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, cachedImage);
    return profilePictureStatus === 200 ? 'Set profile picture to given template.' : 'Unable to set profile picture.';
};

export default profileImageStreamUp;

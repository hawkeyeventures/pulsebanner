import React, { useState } from 'react';
import { useAdmin } from '../../util/hooks/useAdmin';
import {
    Box,
    Center,
    Heading,
    Input,
    FormControl,
    Button,
    Image,
    Text,
    Link,
    SimpleGrid,
    Container,
    Stack,
    VStack,
    Flex,
    Spacer,
    useToast,
} from '@chakra-ui/react';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { getBanner, getUserInfo } from '@app/services/twitter/twitterHelpers';
import { TwitchClientAuthService } from '@app/services/twitch/TwitchClientAuthService';
import { twitchAxios } from '@app/util/axios';
import { UsersLookup } from 'twitter-api-client';
import { useRouter } from 'next/router';
import { Card } from '@app/components/Card';
import axios from 'axios';
import { Features } from '@app/services/FeaturesService';
import prisma from '@app/util/ssr/prisma';
import { User } from '@prisma/client';
import { CustomSession } from '@app/services/auth/CustomSession';
import env from '@app/util/env';
import { AccountsService } from '@app/services/AccountsService';
import { S3Service } from '@app/services/S3Service';

type PageProps = {
    userId: string;
    user: User;
    banner: {
        originalBase64: string;
        backupBase64: string;
        currentSrc: string;
    };
    stream: {
        online: boolean;
        stream: any;
    };
    twitchUserInfo: any;
    twitterUserInfo: UsersLookup;
};

export const getServerSideProps: GetServerSideProps<PageProps | any> = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as CustomSession;

    const userId = context.query.userId;

    if (typeof userId !== 'string' || userId === '') {
        return {
            props: {},
        };
    }

    try {
        const accounts = await AccountsService.getAccountsById(userId);
        const twitchUserId = accounts['twitch'].providerAccountId;
        const imageBase64 = await S3Service.download(env.IMAGE_BUCKET_NAME, userId);
        const backupBase64 = await S3Service.download(env.BANNER_BACKUP_BUCKET, userId);
        const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

        if (!twitterInfo) {
            return {
                props: {},
            };
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);

        // get twitch stream info for user
        // https://dev.twitch.tv/docs/api/reference#get-streams
        const streamResponse = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);
        const bannerUrl: string = await getBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

        const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);
        const twitchUserInfo = userResponse.data.data[0];

        const twitterUserInfo = await getUserInfo(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

        return {
            props: {
                userId,
                user,
                twitterInfo,
                banner: {
                    currentSrc: bannerUrl,
                    backupBase64,
                    originalBase64: imageBase64,
                },
                stream: {
                    online: !!streamResponse.data?.data?.[0],
                    stream: streamResponse.data?.data?.[0],
                },
                twitchUserInfo,
                twitterUserInfo,
            },
        };
    } catch (e) {
        return {
            props: {},
        };
    }
};

export default function Page({ user, userId, banner, stream, twitchUserInfo, twitterUserInfo }: PageProps) {
    useAdmin({ required: true });

    const router = useRouter();
    const toast = useToast();

    const [userIdInput, setUserIdInput] = useState(userId);

    const submit = () => {
        router.push(`?userId=${userIdInput}`);
    };

    const [locked, setLocked] = useState(true);

    const resetOriginalImage = async () => {
        if (userIdInput) {
            await axios.post(`/api/admin/banner/reset-original?userId=${userIdInput}`);
        } else {
            toast({
                status: 'error',
                title: 'Must have userId',
            });
        }
    };

    const test = async () => {
        if (userIdInput) {
            await axios.post(`/api/features/banner/update-original?userId=${userIdInput}`);
        } else {
            toast({
                status: 'error',
                title: 'Must have userId',
            });
        }
    };

    const updateBackup = async () => {
        if (userIdInput) {
            await axios.post(`/api/admin/banner/update-backup?userId=${userIdInput}`);
        } else {
            toast({
                status: 'error',
                title: 'Must have userId',
            });
        }
    };

    const testStreamDown = async (features?: Features[]) => {
        if (userIdInput) {
            const params = new URLSearchParams();
            features?.forEach((feature) => params.append('features', feature));
            await axios.post(`/api/admin/streamdown/${userIdInput}?${params.toString()}`);
            window.location.reload();
        } else {
            toast({
                status: 'error',
                title: 'Must have userId',
            });
        }
    };

    const testStreamUp = async (features?: Features[]) => {
        if (userIdInput) {
            const params = new URLSearchParams();
            features?.forEach((feature) => params.append('features', feature));
            await axios.post(`/api/admin/streamup/${userIdInput}?${params.toString()}`);
            window.location.reload();
        } else {
            toast({
                status: 'error',
                title: 'Must have userId',
            });
        }
    };

    return (
        <Container maxW="container.xl">
            <Center>
                <Heading>User dashboard</Heading>
            </Center>
            <Center p="8">
                <VStack spacing={8}>
                    <Flex w="full">
                        <Spacer />
                        <FormControl maxW="lg">
                            <Stack direction={['column', 'row']} maxW="lg">
                                <Input placeholder="User ID" w="full" defaultValue={userId} onChange={(e) => setUserIdInput(e.target.value)} id="userId" type="userId" />
                                <Button onClick={submit}>Submit</Button>
                            </Stack>
                        </FormControl>
                    </Flex>
                    {userId && (
                        <>
                            <Box w="full">
                                <Card>
                                    <Stack direction={['column', 'row']} w="full" spacing={[2, 8]}>
                                        <Box>
                                            <Text>Name: {user.name}</Text>
                                            <Text>Created at: {user.createdAt.toLocaleDateString()}</Text>
                                        </Box>
                                        <Box>
                                            <Link isExternal href={`https://twitch.tv/${twitchUserInfo.login}`}>
                                                Twitch
                                            </Link>
                                            <Text>
                                                Stream is currently <strong>{stream.online ? '🔴 live' : '⚪️ offline'}</strong>
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Link isExternal href={`https://twitter.com/${twitterUserInfo.screen_name}`}>
                                                Twitter
                                            </Link>

                                            <Text>Twitter followers: {twitterUserInfo.followers_count}</Text>
                                        </Box>
                                        <Button onClick={() => setLocked(!locked)}>Toggle action lock</Button>
                                    </Stack>
                                </Card>
                            </Box>
                            <Box w="full">
                                <Card>
                                    <VStack>
                                        <Heading w="full" fontSize="xl">
                                            Profile image details
                                        </Heading>
                                        <Stack direction={['column', 'row']} w="full">
                                            <Button disabled={locked} onClick={() => testStreamUp(['profileImage'])}>
                                                Trigger profile image streamup
                                            </Button>
                                            <Button disabled={locked} onClick={() => testStreamDown(['profileImage'])}>
                                                Trigger profile image streamdown
                                            </Button>
                                        </Stack>
                                    </VStack>
                                </Card>
                            </Box>
                            <Box w="full">
                                <Card>
                                    <VStack>
                                        <Heading w="full" fontSize="xl">
                                            Name details
                                        </Heading>
                                        <Stack direction={['column', 'row']} w="full">
                                            <Button disabled={locked} onClick={() => testStreamUp(['twitterName'])}>
                                                Trigger name streamup
                                            </Button>
                                            <Button disabled={locked} onClick={() => testStreamDown(['twitterName'])}>
                                                Trigger name streamdown
                                            </Button>
                                        </Stack>
                                    </VStack>
                                </Card>
                            </Box>
                            <Box w="full">
                                <Card>
                                    <VStack>
                                        <Heading w="full" fontSize="xl">
                                            Banner details
                                        </Heading>
                                        <Stack direction={['column', 'row']} w="full">
                                            <Button disabled={locked} onClick={updateBackup}>
                                                Update backup
                                            </Button>
                                            <Button disabled={locked} onClick={resetOriginalImage}>
                                                Reset original banner with backup
                                            </Button>
                                            <Button disabled={locked} onClick={() => testStreamUp(['banner'])}>
                                                Trigger banner streamup
                                            </Button>
                                            <Button disabled={locked} onClick={() => testStreamDown(['banner'])}>
                                                Trigger banner streamdown
                                            </Button>
                                            <Button onClick={() => test()}>Test</Button>
                                        </Stack>
                                        <SimpleGrid columns={[1, 1, 1, 2]} spacing={2} p={[2, 4]}>
                                            <Box>
                                                <Text>Current Twitter banner</Text>
                                                <Image alt="Current banner" src={banner.currentSrc} />
                                            </Box>
                                            <Box>
                                                <Text>Original banner</Text>
                                                <Image alt="Original banner image" src={`data:image/jpeg;base64,${banner.originalBase64}`} />
                                            </Box>
                                            <Box>
                                                <Text>Backup banner</Text>
                                                <Image alt="Backup banner" src={`data:image/jpeg;base64,${banner.backupBase64}`} />
                                            </Box>
                                        </SimpleGrid>
                                    </VStack>
                                </Card>
                            </Box>
                        </>
                    )}
                </VStack>
            </Center>
        </Container>
    );
}

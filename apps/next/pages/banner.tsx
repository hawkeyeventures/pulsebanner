import { Button, ButtonGroup, Center, Heading, VStack } from '@chakra-ui/react';
import { Banner } from '@prisma/client';
import React from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Player } from '@remotion/player';
import { TwitchStream } from '@pulsebanner/templates';

export default function Page() {
    const { data, mutate } = useSWR<Banner>('banner', async () => (await fetch('/api/banner')).json());

    const upsertBanner = async () => {
        const response = await axios.post('/api/banner?templateId=123');
        mutate();
    };

    const refreshBanner = async () => {
        const response = await axios.post('/api/banner?fetchImage=true');
        mutate();
    };

    const toggle = async () => {
        await axios.put('/api/banner');
        mutate({
            ...data,
            enabled: !data.enabled,
        });
    };

    return (
        <>
            <Center>
                <VStack spacing="8">
                    <Heading>Banner setup</Heading>
                    <ButtonGroup>
                        <Button onClick={async () => await upsertBanner()}>Setup banner</Button>
                        <Button onClick={async () => await toggle()} disabled={!data}>
                            {data && data.enabled ? 'Turn off live banner' : 'Turn on live banner'}
                        </Button>
                    </ButtonGroup>
                    <pre>{data ? JSON.stringify(data, null, 4) : 'No banner'}</pre>
                </VStack>
            </Center>
            <Center>
                <Player
                    inputProps={{
                        text: 'hello world',
                        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_teampgp-440x248.jpg',
                    }}
                    component={TwitchStream}
                    durationInFrames={1}
                    compositionWidth={1500}
                    compositionHeight={500}
                    fps={1}
                    style={{ width: '75%', fontSize: '28px' }}
                />
            </Center>
        </>
    );
}

import { Box, Button, ButtonGroup, Center, Container, Heading, HStack, SimpleGrid, VStack } from '@chakra-ui/react';
import type { Banner } from '@prisma/client';
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Composer } from '@pulsebanner/remotion/components';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import dynamic from 'next/dynamic';
import { FaPlay, FaStop } from 'react-icons/fa';
import { Player } from '@remotion/player';
import { AnyComponent } from 'remotion';

const DynamicPlayer = dynamic(async () => (await import('@remotion/player')).Player);

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

    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>('CSSBackground');
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>('TwitchStream');
    const [bgProps, setBgProps] = useState({} as any);

    return (
        <Container centerContent maxW="container.lg" experimental_spaceY="4">
            <HStack w="full">
                <Button
                    colorScheme={data && data.enabled ? 'red' : 'green'}
                    justifySelf="flex-end"
                    disabled={!data}
                    leftIcon={data && data.enabled ? <FaStop /> : <FaPlay />}
                    px="8"
                    onClick={toggle}
                >
                    {data && data.enabled ? 'Turn off live banner' : 'Turn on live banner'}
                </Button>
                <Heading fontSize="lg" w="full" textAlign="center">
                    {data && data.enabled ? 'Your banner is enabled.' : 'Live banner not enabled.'}
                </Heading>
            </HStack>
            <Box w="full" p="4" bg="gray.700" rounded="md">
                <Heading fontSize="xl">Backgrounds</Heading>

                <SimpleGrid columns={2} spacing="4" py="2">
                    {Object.entries(BackgroundTemplates).map(([key, background]) => (
                        <Box key={key}>
                            <Button onClick={() => setBgId(key as keyof typeof BackgroundTemplates)}>Use {background.name}</Button>

                            <Player
                                inputProps={undefined}
                                component={background.component as AnyComponent<any>}
                                durationInFrames={1}
                                compositionWidth={1500}
                                compositionHeight={500}
                                fps={1}
                                key={key}
                                style={{ width: '100%', maxWidth: '1000px', fontSize: '28px' }}
                            />
                        </Box>
                    ))}
                </SimpleGrid>
                <Heading fontSize="xl">Styles</Heading>
                <SimpleGrid columns={2} spacing="4" py="2">
                    {Object.entries(ForegroundTemplates).map(([key, foreground]) => (
                        <Box key={key}>
                            <Button onClick={() => setFgId(key as keyof typeof ForegroundTemplates)}>Use {foreground.name}</Button>

                            <Player
                                inputProps={{
                                    backgroundId: bgId,
                                    foregroundId: key as keyof typeof ForegroundTemplates,
                                    backgroundProps: {},
                                    foregroundProps: {},
                                }}
                                component={Composer}
                                durationInFrames={1}
                                compositionWidth={1500}
                                compositionHeight={500}
                                fps={1}
                                key={key}
                                style={{ width: '100%', maxWidth: '1000px', fontSize: '28px' }}
                            />
                        </Box>
                    ))}
                </SimpleGrid>

                <Player
                    inputProps={{
                        backgroundId: bgId,
                        foregroundId: fgId,
                        backgroundProps: { ...BackgroundTemplates[bgId].defaultProps, ...bgProps },
                        foregroundProps: {},
                    }}
                    component={Composer}
                    durationInFrames={1}
                    compositionWidth={1500}
                    compositionHeight={500}
                    fps={1}
                    style={{ width: '100%', maxWidth: '1000px', fontSize: '28px' }}
                />

                <Center>
                    <VStack spacing="8">
                        <Heading>Banner setup</Heading>
                        <ButtonGroup>
                            <Button onClick={async () => await upsertBanner()}>Setup banner</Button>
                            <Button onClick={async () => await toggle()} disabled={!data}>
                                {data && data.enabled ? 'Turn off live banner' : 'Turn on live banner'}
                            </Button>
                        </ButtonGroup>
                    </VStack>
                </Center>

                <Center>
                    {BackgroundTemplates[bgId].form({
                        setProps: setBgProps,
                        props: bgProps,
                    })}
                </Center>
            </Box>
        </Container>
    );
}
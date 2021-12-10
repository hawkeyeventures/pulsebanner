import {
    Box,
    Button,
    Center,
    Checkbox,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Select,
    Spacer,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useBoolean,
    useBreakpoint,
    Text,
    useDisclosure,
    VStack,
    Link,
    useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { Composer } from '@pulsebanner/remotion/components';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import { RemotionPreview } from '@pulsebanner/remotion/preview';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { StarIcon } from '@chakra-ui/icons';
import { trackEvent } from '@app/util/umami/trackEvent';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { discordLink } from '@app/util/constants';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { DisableBannerModal } from '@app/components/banner/DisableBannerModal';
import { useSession } from 'next-auth/react';

const bannerEndpoint = '/api/features/banner';
const defaultForeground: keyof typeof ForegroundTemplates = 'ImLive';
const defaultBackground: keyof typeof BackgroundTemplates = 'GradientBackground';

export default function Page() {
    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>(defaultBackground);
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>(defaultForeground);
    const [bgProps, setBgProps] = useState(BackgroundTemplates[defaultBackground].defaultProps as any);
    const [fgProps, setFgProps] = useState(ForegroundTemplates[defaultForeground].defaultProps as any);
    const [watermark, setWatermark] = useState(true);

    const BackgroundTemplate = BackgroundTemplates[bgId];
    const ForegroundTemplate = ForegroundTemplates[fgId];
    const Form = BackgroundTemplate.form;
    const FgForm = ForegroundTemplate.form;

    const sessionInfo = useSession();
    const userId = sessionInfo.data?.userId;

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const toast = useToast();
    const breakpoint = useBreakpoint();

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());

    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const availableForAccount = (): boolean => {
        // if they have a free plan and they are not a partner
        if (paymentPlan === 'Free' && !paymentPlanResponse?.partner) {
            return false;
        }
        return true;
    };

    const [usernameLoaded, setUsernameLoaded] = useState(false);
    const [banner, setBanner] = useState({} as any);

    useEffect(() => {
        if (sessionInfo && userId) {
            axios.get(bannerEndpoint).then((bannerResponse) => {
                axios.get(`/api/twitch/username/${userId as string}`).then((response) => {
                    if (response.data) {
                        setBanner(response.data);
                        setBgId((bannerResponse.data?.backgroundId as keyof typeof BackgroundTemplates) ?? defaultBackground);
                        setFgId((bannerResponse.data?.foregroundId as keyof typeof ForegroundTemplates) ?? defaultForeground);
                        setBgProps(bannerResponse.data?.backgroundProps ?? {});
                        setFgProps({ ...(bannerResponse.data?.foregroundProps as any), username: response.data.displayName } ?? {});
                        setUsernameLoaded(true);
                    }
                });
            });
        }
    }, [sessionInfo, userId, usernameLoaded]);

    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('banner');

    const [isToggling, { on, off }] = useBoolean(false);

    const saveSettings = async () => {
        // ensure user is signed up before saving settings
        if (ensureSignUp()) {
            const response = await axios.post(bannerEndpoint, {
                foregroundId: fgId,
                backgroundId: bgId,
                backgroundProps: { ...BackgroundTemplate.defaultProps, ...bgProps },
                foregroundProps: { ...ForegroundTemplate.defaultProps, ...fgProps },
            });
        }
    };

    const toggle = async () => {
        // ensure user is signed up before enabling banner
        if (ensureSignUp()) {
            umami(banner && banner.enabled ? 'disable-banner' : 'enable-banner');
            on();
            await saveSettings();
            await axios.put(bannerEndpoint);
            off();
            if (banner && banner.enabled) {
                bannerDisabledToggle();
            } else {
                toast({
                    title: 'Banner Activated',
                    description: 'Your banner will be updated automatically next time you stream!',
                    status: 'success',
                    duration: 7000,
                    isClosable: true,
                    position: 'top',
                });
            }
        }
    };

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();
    const { isOpen: disableBannerIsOpen, onClose: disableBannerOnClose, onToggle: bannerDisabledToggle } = useDisclosure();

    const showPricing: (force?: boolean) => boolean = (force?: boolean) => {
        if (!availableForAccount() || force) {
            umami('show-pricing-modal');
            pricingToggle();
            return false;
        }
        return true;
    };

    const EnableButton = (
        <VStack>
            <Button
                colorScheme={banner && banner.enabled ? 'red' : 'green'}
                justifySelf="flex-end"
                isLoading={isToggling}
                leftIcon={banner && banner.enabled ? <FaStop /> : <FaPlay />}
                px="8"
                onClick={toggle}
                className={trackEvent('click', 'toggle-banner-button')}
            >
                {banner && banner.enabled ? 'Turn off live banner' : 'Turn on live banner'}
            </Button>
            <Heading fontSize="lg" w="full" textAlign="center">
                {banner && banner.enabled ? 'Your banner is enabled.' : 'Live banner not enabled.'}
            </Heading>
        </VStack>
    );

    return (
        <>
            <DisableBannerModal isOpen={disableBannerIsOpen} onClose={disableBannerOnClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} currentPage="banner" />
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']} justifyContent="space-between" alignItems="center">
                    <Box maxW="xl">
                        <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']}>
                            Twitch live banner
                        </Heading>
                        <Heading fontSize="md" fontWeight="normal" as="h2">
                            Your Twitter banner will update when you start broadcasting on Twitch. Your banner will revert back to your current banner image when your stream ends.
                        </Heading>

                        <HStack pt={['2', '2']} pb={['2', '0']}>
                            <Text textAlign={['center', 'left']} h="full">
                                Need help? 👉{' '}
                            </Text>
                            <Link isExternal href={discordLink}>
                                <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </HStack>
                    </Box>
                    {EnableButton}
                </Flex>
                <Flex w="full" rounded="md" direction="column">
                    <Center w="full">
                        <RemotionPreview compositionHeight={500} compositionWidth={1500}>
                            <Composer
                                {...{
                                    backgroundId: bgId,
                                    foregroundId: fgId,
                                    backgroundProps: { ...BackgroundTemplates[bgId].defaultProps, ...bgProps },
                                    foregroundProps: { ...ForegroundTemplates[fgId].defaultProps, ...fgProps },
                                    watermark: availableForAccount() ? watermark : true,
                                }}
                            />
                        </RemotionPreview>
                    </Center>

                    <Flex grow={1} p="4" my="4" rounded="md" bg="whiteAlpha.100" w="full" direction="column" minH="lg">
                        <Tabs colorScheme="purple" flexGrow={1}>
                            <TabList>
                                <Tab className={trackEvent('click', 'banner-tab')}>Banner</Tab>
                                <Tab className={trackEvent('click', 'background-tab')}>Background</Tab>
                            </TabList>

                            <TabPanels flexGrow={1}>
                                <TabPanel>
                                    <FgForm
                                        setProps={(s) => {
                                            console.log('set props', s);
                                            setFgProps(s);
                                        }}
                                        props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }}
                                        availableFeature={availableForAccount()}
                                        showPricing={showPricing}
                                    />
                                </TabPanel>
                                <TabPanel>
                                    <FormControl id="country">
                                        <FormLabel>Background type</FormLabel>
                                        <Select
                                            value={bgId}
                                            w="fit-content"
                                            onChange={(e) => {
                                                setBgId(e.target.value as keyof typeof BackgroundTemplates);
                                            }}
                                        >
                                            {Object.entries(BackgroundTemplates).map(([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Box py="4">
                                        <Form
                                            setProps={(p) => {
                                                setBgProps({ ...BackgroundTemplates[bgId].defaultProps, ...p });
                                            }}
                                            props={{ ...BackgroundTemplates[bgId].defaultProps, ...bgProps }}
                                            showPricing={showPricing}
                                            availableFeature={availableForAccount()}
                                        />
                                    </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>

                        <HStack px="6">
                            <Checkbox
                                colorScheme="purple"
                                defaultChecked={watermark}
                                isChecked={availableForAccount() ? watermark : true}
                                size="lg"
                                className={trackEvent('click', 'watermark-checkbox')}
                                onChange={(e) => {
                                    e.preventDefault();
                                    if (availableForAccount() === false) {
                                        pricingToggle();
                                    } else {
                                        setWatermark(!watermark);
                                    }
                                }}
                            >
                                Show watermark
                            </Checkbox>
                            <Box>
                                {breakpoint === 'base' && (
                                    <IconButton w="min" aria-label="Premium" icon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => pricingToggle()} />
                                )}
                                {breakpoint !== 'base' && (
                                    <Button
                                        leftIcon={<StarIcon />}
                                        colorScheme="teal"
                                        variant="ghost"
                                        onClick={() => pricingToggle()}
                                        className={trackEvent('click', 'premium-watermark-button')}
                                    >
                                        Premium
                                    </Button>
                                )}
                            </Box>
                        </HStack>
                        <Flex justifyContent="space-between" direction={['column', 'row']}>
                            <Spacer />
                            <HStack>
                                <Text>{hasUnsavedChanges ? 'Unsaved changes' : ''}</Text>
                                <Button my="2" onClick={saveSettings} className={trackEvent('click', 'save-settings-button')}>
                                    Save settings
                                </Button>
                            </HStack>
                        </Flex>
                    </Flex>
                    <Flex w="full" flexDirection="row" justifyContent="space-between">
                        <Spacer />
                        {EnableButton}
                    </Flex>
                </Flex>
                <Box pt="8">
                    <ShareToTwitter />
                </Box>
            </Container>
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
        </>
    );
}

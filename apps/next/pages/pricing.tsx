import { Price, PriceInterval, Product } from '@prisma/client';
import type { GetServerSideProps, GetStaticProps, NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Button,
    Heading,
    Text,
    Center,
    chakra,
    Container,
    VStack,
    SimpleGrid,
    HStack,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Switch,
    Tag,
    Flex,
    Link,
    Box,
    WrapItem,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Image,
    useBreakpoint,
    LightMode,
    DarkMode,
    Grid,
    GridItem,
    Tooltip,
    Spacer,
} from '@chakra-ui/react';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck, FaArrowRight, FaHeart } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';
import { trackEvent } from '@app/util/umami/trackEvent';
import { PaymentPlan } from '@app/util/database/paymentHelpers';
import { NextSeo } from 'next-seo';
import { generalFaqItems, pricingFaqItems } from '@app/modules/faq/data';
import { FaqSection } from '@app/modules/faq/FaqSection';
import { usePaymentPlan } from '@app/util/hooks/usePaymentPlan';
import { FreeProductCard } from '@app/components/pricing/FreeProductCard';
import { Card } from '@app/components/Card';
import { landingPageAsset } from '.';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { GiftCard } from '@app/components/pricing/GiftCard';
import { ButtonSwitch } from '@app/components/buttonSwitch/ButtonSwitch';
import ReactCanvasConfetti from 'react-canvas-confetti';
import { giftPriceIds } from '@app/util/stripe/gift/constants';
import { GiftPricing } from '@app/modules/pricing/GiftPricing';

type Props = {
    products: (Product & { prices: Price[] })[];
    prices: (Price & { product: Product })[];
    priceMap: Record<string, Price & { product: Product }>;
};

const Page: NextPage<Props> = ({ products, priceMap }) => {
    const [paymentPlan, paymentPlanResponse] = usePaymentPlan();
    const { data: session } = useSession({ required: false }) as any;

    const router = useRouter();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [giftProduct, setGiftProduct] = useState<Exclude<PaymentPlan, 'Free'>>('Personal');

    const breakpoint = useBreakpoint('sm');

    const canvasStyles: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: breakpoint === 'base' ? 100 : 500,
        right: 0,
    };

    const ensureSignUp = useCallback(() => {
        if (session?.accounts?.twitter) {
            return true;
        }
        onOpen();
        return false;
    }, [session, onOpen]);

    const [billingInterval, setBillingInterval] = useState<PriceInterval>('year');

    const sortProductsByPrice = (
        products: (Product & {
            prices: Price[];
        })[]
    ) =>
        products
            .filter((a) => !a.name.includes('Gift'))
            .sort((a, b) => a?.prices?.find((one) => one.interval === billingInterval)?.unitAmount - b?.prices?.find((one) => one.interval === billingInterval)?.unitAmount);

    const giftingProducts = (
        products: (Product & {
            prices: Price[];
        })[]
    ) => products.filter((a) => a.name.includes('Gift'));

    const handlePricingClick = useCallback(
        async (priceId: string, isSubscription: boolean, quantity?: number) => {
            router.push(
                {
                    query: {
                        priceId,
                    },
                },
                undefined,
                { shallow: true }
            );
            if (ensureSignUp()) {
                if (isSubscription && (paymentPlan === 'Professional' || paymentPlan === 'Personal')) {
                    const res = await fetch('/api/stripe/create-portal', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                    });

                    const data = await res.json();
                    router.push(data.subscriptionUrl);
                }

                const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        price: priceId,
                        isSubscription,
                        quantity: quantity ?? 1,
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, paymentPlan, ensureSignUp]
    );

    const refAnimationInstance = useRef(null);

    const getInstance = useCallback((instance) => {
        refAnimationInstance.current = instance;
    }, []);

    const makeShot = useCallback((particleRatio, opts) => {
        refAnimationInstance.current &&
            refAnimationInstance.current({
                ...opts,
                origin: { y: 0.7 },
                particleCount: Math.floor(200 * particleRatio),
            });
    }, []);

    const fire = useCallback(() => {
        makeShot(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        makeShot(0.2, {
            spread: 60,
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, [makeShot]);

    const AnnualBillingControl = (
        <VStack spacing={1}>
            <ButtonSwitch
                defaultIndex={1}
                onChange={(index) => {
                    if (index === 0) {
                        setBillingInterval('month');
                    } else {
                        setBillingInterval('year');
                    }
                }}
            >
                <Text>Monthly billing</Text>
                <VStack spacing={0}>
                    <Text>Yearly billing</Text>
                    <LightMode>
                        <Tag size="sm" colorScheme={'green'} fontSize={'xs'}>
                            Save 15%
                        </Tag>
                    </LightMode>
                </VStack>
            </ButtonSwitch>
            <Center>
                <Text fontSize="xs">Choose between monthly or annual pricing</Text>
            </Center>
        </VStack>
    );

    const GiftProductSwitch = (
        <VStack mb="4">
            <Center>
                <ButtonSwitch
                    defaultIndex={0}
                    onChange={(index) => {
                        setGiftProduct(index ? 'Professional' : 'Personal');
                    }}
                >
                    <Text>Personal</Text>
                    <Text>Professional</Text>
                </ButtonSwitch>
            </Center>
            <Center>
                <Text fontSize="xs" whiteSpace={'pre-wrap'} mx="4" textAlign={'center'}>
                    Choose between Personal or Professional gifts
                </Text>
            </Center>
        </VStack>
    );

    const giftIds = giftPriceIds[giftProduct];
    const gift = (duration: keyof typeof giftIds) => priceMap[giftIds[duration]];
    return (
        <>
            <NextSeo title="Pricing" />
            <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Center>Almost there!</Center>
                        <Center>Connect to Twitter to continue.</Center>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody minH="32" h="32" pb="4">
                        <Flex h="full" direction="column" justifyContent="space-between">
                            <VStack grow={1}>
                                <Button
                                    onClick={() => {
                                        if (session?.accounts?.twitter) {
                                            return;
                                        }

                                        const url = new window.URL(window.location.href);
                                        url.searchParams.append('modal', 'true');

                                        signIn('twitter', {
                                            callbackUrl: url.pathname + url.search,
                                        });
                                    }}
                                    colorScheme="twitter"
                                    leftIcon={<FaTwitter />}
                                    rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}
                                >
                                    Connect to Twitter
                                </Button>
                            </VStack>
                            <Center>
                                <Text fontSize="sm">
                                    {'By signing up, you agree to our'}{' '}
                                    <Link as={NextLink} href="/terms" passHref>
                                        Terms
                                    </Link>{' '}
                                    and{' '}
                                    <Link as={NextLink} href="/privacy" passHref>
                                        Privacy Policy
                                    </Link>
                                </Text>
                            </Center>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Container maxW="container.lg" experimental_spaceY="6" pb="8" mt="-8">
                <Heading size="xl" textAlign="center" h="full" bgGradient="linear(to-r, #2AA9ff, #f246FF)" bgClip="text" fontSize={['5xl', '7xl']} fontWeight="bold">
                    PulseBanner Memberships
                </Heading>
            </Container>

            <VStack spacing={[6, 12]} w="full">
                <Container maxW="container.xl" position={'relative'} experimental_spaceY={24}>
                    <Container maxW="container.lg">
                        {breakpoint !== 'base' && (
                            <Box my="4">
                                <FreeProductCard />
                            </Box>
                        )}
                        <Center w={['auto', 'auto', 'auto', 'auto']}>
                            <SimpleGrid columns={[1, 1, 1, 3]} spacing="4" w="full">
                                <WrapItem key={'free2'} w="full" h="full">
                                    <Card props={{ color: 'white', p: '0', border: 'none', w: 'full', h: 'full', bgGradient: 'linear(to-tr, #9246FF, #2AA9E0)' }}>
                                        <Flex direction={'column'} justifyItems="stretch" h="full" rounded="md">
                                            <Box p="4" px="6" flexGrow={1} w="full">
                                                <Text fontSize={'2xl'}>Level up with a</Text>
                                                <Heading>PulseBanner Membership.</Heading>
                                                <Text my="4">Choose a plan and begin customizing in seconds. Then experience how PulseBanner can help you grow.</Text>

                                                {breakpoint !== 'base' && (
                                                    <HStack>
                                                        <Text fontWeight={'bold'} fontSize={'xl'}>
                                                            Select a plan
                                                        </Text>
                                                        <ArrowRightIcon />
                                                    </HStack>
                                                )}
                                                {breakpoint === 'base' && <Center mb="6">{AnnualBillingControl}</Center>}
                                                {breakpoint === 'base' && (
                                                    <HStack>
                                                        <Text fontWeight={'bold'} fontSize={'xl'}>
                                                            Select a plan
                                                        </Text>
                                                        <ArrowRightIcon transform={'rotate(90deg)'} />
                                                    </HStack>
                                                )}
                                            </Box>
                                            {breakpoint !== 'base' && <Center mb="2">{AnnualBillingControl}</Center>}
                                        </Flex>
                                    </Card>
                                </WrapItem>
                                {sortProductsByPrice(products).map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        billingInterval={billingInterval}
                                        handlePricingClick={(priceId) => handlePricingClick(priceId, true)}
                                        paymentPlan={paymentPlan}
                                        paymentPlanResponse={paymentPlanResponse}
                                    />
                                ))}
                                {breakpoint === 'base' && (
                                    <Box>
                                        <FreeProductCard modal />
                                    </Box>
                                )}
                            </SimpleGrid>
                        </Center>
                        <Container centerContent maxW="container.lg" experimental_spaceY="4" pt="4">
                            <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
                        </Container>
                    </Container>
                    <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '80%', display: 'block' }}>
                        <div className="contact-hero" style={{ position: 'relative', top: '-500px', left: '-600px', height: '38%' }}>
                            <div className="bg-gradient-blur-wrapper contact-hero">
                                <div className="bg-gradient-blur-circle-2 blue"></div>
                                <div className="bg-gradient-blur-circle-4 purple"></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '100%', display: 'block' }}>
                        <div className="contact-hero" style={{ position: 'relative', top: '-300px', left: '0px', height: '78%' }}>
                            <div className="bg-gradient-blur-wrapper contact-hero">
                                <div className="bg-gradient-blur-circle-3 pink top"></div>
                                <div className="bg-gradient-blur-circle-2 blue"></div>
                                <div className="bg-gradient-blur-circle-4 purple"></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '70%', display: 'block' }}>
                        <div className="contact-hero" style={{ position: 'relative', top: '480px', left: '-300px', height: '58%' }}>
                            <div className="bg-gradient-blur-wrapper contact-hero">
                                <div className="bg-gradient-blur-circle-3 pink top"></div>
                                <div className="bg-gradient-blur-circle-2 blue"></div>
                                <div className="bg-gradient-blur-circle-4 purple"></div>
                            </div>
                        </div>
                    </div>

                    <Box>
                        <Center>
                            <Text textAlign="center" fontSize="3xl" maxW="container.md">
                                Unlock even more awesome features and kindly support us by becoming a PulseBanner Member ♥️
                            </Text>
                        </Center>
                    </Box>

                    <Container w="full" maxW={[undefined, 'container.xl']} px="0">
                        <GiftPricing priceMap={priceMap} />
                    </Container>
                </Container>

                <Container centerContent maxW="container.lg" experimental_spaceY="4">
                    <Text textAlign="center" maxW="4xl" px="4" fontSize="2xl">
                        Just like you, the people behind PulseBanner are creators. And like you, we rely on PulseBanner Memberships to keep improving and maintaining PulseBanner.
                    </Text>

                    <Text textAlign="center" maxW="4xl" px="4" fontSize="2xl">
                        Help empower creators by supporting us ♥️
                    </Text>
                    <Box pt="32">
                        <FaqSection items={pricingFaqItems.concat(generalFaqItems)} />
                    </Box>
                </Container>
            </VStack>
        </>
    );
};

// Since we export getServerSideProps method in this file, it means this page will be rendered on the server
// aka this page is server-side rendered
// This method is run on the server, then the return value is passed in as props to the component above
export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const products = await prisma.product.findMany({
        where: {
            active: true,
        },
        include: {
            prices: {
                where: {
                    active: true,
                },
            },
        },
    });

    const prices = await prisma.price.findMany({
        where: {
            active: true,
            AND: {
                product: {
                    active: true,
                },
            },
        },
        include: {
            product: true,
        },
    });

    const priceMap: Record<string, typeof prices[0]> = prices.reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
    }, {});

    return {
        props: {
            products,
            prices,
            priceMap,
        },
    };
};

export default Page;

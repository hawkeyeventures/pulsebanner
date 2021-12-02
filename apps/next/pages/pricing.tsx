import { Price, PriceInterval, Product, Subscription } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
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
    Img,
} from '@chakra-ui/react';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';
import { trackEvent } from '@app/util/umami/trackEvent';
import favicon from '@app/public/logo.webp';

type Props = {
    products: (Product & { prices: Price[] })[];
};

const Page: NextPage<Props> = ({ products }) => {
    const [subscription, setSubscription] = useState<Subscription>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { status, data: session } = useSession({ required: false }) as any;

    const router = useRouter();
    const { modal, priceId } = router.query;

    const { isOpen, onOpen, onClose } = useDisclosure();

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
    ) => products.sort((a, b) => a?.prices?.find((one) => one.interval === billingInterval)?.unitAmount - b?.prices?.find((one) => one.interval === billingInterval)?.unitAmount);

    useEffect(() => {
        (async () => {
            if (status === 'authenticated') {
                const res = await fetch('/api/user/subscription');

                const data = await res.json();

                if (data.subscription) {
                    setSubscription(data.subscription);
                }
            }
        })();
    }, [status]);

    const handlePricingClick = useCallback(
        async (priceId: string) => {
            router.push({
                query: {
                    priceId,
                },
            });
            if (ensureSignUp()) {
                if (subscription) {
                    return router.push('/account');
                }

                const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        price: priceId,
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, subscription, ensureSignUp]
    );

    useEffect(() => {
        if (modal === 'true') {
            if (session && !session?.accounts?.twitter) {
                onOpen();
            }
            router.replace(router.pathname);
            if (priceId) {
                handlePricingClick(priceId as string);
            }
        }
    }, [modal, router, onOpen, session, onClose, handlePricingClick, priceId]);

    const AnnualBillingControl = (
        <HStack display="flex" alignItems="center" spacing={4} fontSize="lg">
            <Switch
                id="billingInterval"
                className={trackEvent('click', 'billing-interval-switch')}
                size="lg"
                colorScheme="green"
                isChecked={billingInterval === 'year'}
                onChange={(v) => {
                    setBillingInterval(billingInterval === 'year' ? 'month' : 'year');
                }}
            />

            <Text style={{ WebkitTextStrokeWidth: billingInterval === 'year' ? '0.75px' : '0.25px' }} as={chakra.span}>
                Yearly billing
            </Text>
            <Tag size="md" variant="solid" background={billingInterval === 'year' ? 'green.200' : 'gray.200'} color="black">
                Two months free!
            </Tag>
        </HStack>
    );

    return (
        <>
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
                                        console.log(router);
                                        const url = new window.URL(window.location.href);
                                        console.log('url', url);
                                        url.searchParams.append('modal', 'true');

                                        console.log(url.pathname + url.search);

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
            <VStack spacing={[6, 12]}>
                <VStack spacing={8}>
                    <VStack spacing={0}>
                        <HStack fontSize="xl">
                            <Text fontSize="2xl" fontWeight="bold">
                                PulseBanner is
                            </Text>
                            <Tag size="lg" p="2" py="1" fontSize="2xl" variant="solid" background="green.200" color="black" fontWeight="bold">
                                FREE
                            </Tag>
                        </HStack>
                        <Text textAlign="center" maxW="2xl" px="4" fontSize="xl">
                            You can use PulseBanner for free forever 🎉
                        </Text>
                    </VStack>

                    <Text textAlign="center" maxW="2xl" px="4" fontSize="xl">
                        However, you can unlock even more awesome features and kindly support the creators with a PulseBanner Membership.
                    </Text>
                </VStack>

                <Container centerContent maxW="container.lg" experimental_spaceY="6">
                    <Heading size="xl" textAlign="center" h="full">
                        PulseBanner Memberships
                    </Heading>
                </Container>

                {AnnualBillingControl}
                <Center w={['auto', 'auto', 'auto', '5xl']}>
                    <SimpleGrid columns={[1, 1, 1, 2]} spacing="4" w="full">
                        {sortProductsByPrice(products).map((product) => (
                            <ProductCard key={product.id} product={product} billingInterval={billingInterval} handlePricingClick={handlePricingClick} />
                        ))}
                    </SimpleGrid>
                </Center>
                <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
                <Text textAlign="center" maxW="2xl" px="4" fontSize="xl">
                    Just like you, the people behind PulseBanner are creators. And like you, we rely on PulseBanner Memberships to keep improving and maintaining PulseBanner.
                    Supporting PulseBanner enables us to do what we love and empower creators ❤️
                </Text>
            </VStack>
        </>
    );
};

// Since we export getServerSideProps method in this file, it means this page will be rendered on the server
// aka this page is server-side rendered
// This method is run on the server, then the return value is passed in as props to the component above
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
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

    return {
        props: {
            products,
        },
    };
};

export default Page;

import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { CheckIcon } from '@chakra-ui/icons';
import { WrapItem, Box, Flex, VStack, Heading, HStack, chakra, ScaleFade, Button, List, ListItem, ListIcon, Text, Tag, Stack, Spacer } from '@chakra-ui/react';
import type { Price, PriceInterval, Product } from '@prisma/client';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import useSWR from 'swr';
import { Card } from '../Card';

interface ProductProps {
    product: Product & { prices: Price[] };
    billingInterval: PriceInterval;
    handlePricingClick: (priceId: string) => void;
}

export const ProductCard: React.FC<ProductProps> = ({ product, billingInterval, handlePricingClick }) => {
    const price: Price = product?.prices?.find((one: Price) => one.interval === billingInterval);
    const monthlyPrice: Price = product?.prices.find((one: Price) => one.interval === 'month');

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    if (!price || !monthlyPrice) {
        return null;
    }

    const sharedFeatureList = ['Unlimited color options', 'Upload a custom background image', 'Custom fonts', 'Name Changer ⭐ NEW'];
    const personalFeatureList = sharedFeatureList.concat(['High quality image rendering', 'Thumbnail refreshing (coming soon)']);
    const professionalFeatureList = sharedFeatureList.concat(['Remove watermark', 'Ultra high image quality', 'Unlock all features', 'Fast thumbnail refresh (coming soon)']);

    const featureDescriptionMapping: Record<string, string[]> = {
        Personal: personalFeatureList,
        Professional: professionalFeatureList,
    };

    return (
        <WrapItem key={product.name} w="full" h="full">
            <Card props={{ w: 'full', h: 'full' }}>
                <Box w="full" experimental_spaceY={4}>
                    <Flex direction="row" justify="space-between" alignItems="center">
                        <VStack alignItems="start" spacing={0}>
                            <Heading size="lg">{product.name}</Heading>
                            <Text>{product.description ?? 'Missing description'}</Text>
                        </VStack>
                    </Flex>
                </Box>
                <Flex direction="row" justify="space-between" alignItems="center" justifyContent="center">
                    <VStack spacing={0} onClick={() => handlePricingClick(price.id)} cursor="pointer">
                        <Stack direction={['row', 'row']} alignItems={['center', 'center']} w="full" spacing={2}>
                            {billingInterval === 'month' && (
                                <Text fontSize="2xl" fontWeight="extrabold" lineHeight="tight" as={chakra.span} bg="green.200" px="1" py="0.5" rounded="md" color="black">
                                    {`$${(price.unitAmount / 100).toFixed(2)}`}
                                </Text>
                            )}
                            {billingInterval === 'year' && (
                                <>
                                    <Text fontSize="2xl" fontWeight="extrabold" lineHeight="tight" as={chakra.span} bg="green.200" px="1" py="0.5" rounded="md" color="black">
                                        {`$${(price.unitAmount / 100 / (billingInterval === 'year' ? 12 : 1)).toFixed(2)}`}
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="extrabold" lineHeight="tight" as="s">{`$${monthlyPrice.unitAmount / 100}`}</Text>
                                </>
                            )}
                        </Stack>

                        <Box w="full">
                            {billingInterval === 'year' && (
                                <ScaleFade initialScale={0.9} in={billingInterval === 'year'} style={{ width: '100%' }}>
                                    <Text fontSize="xs" w={['full', 'full']} textAlign="right" pr={['2', 0]}>
                                        per month{billingInterval === 'year' ? ', billed annually' : ''}
                                    </Text>
                                </ScaleFade>
                            )}
                            {billingInterval === 'month' && (
                                <ScaleFade initialScale={0.9} in={billingInterval === 'month'} style={{ width: '100%' }}>
                                    <Text fontSize="xs" textAlign="right" w={['90px', 'full']} pr={['2', 0]}>
                                        per month
                                    </Text>
                                </ScaleFade>
                            )}
                        </Box>
                    </VStack>
                </Flex>

                <Box flexGrow={2}>
                    <Heading size="md">{"What's included"}</Heading>
                    <List>
                        {featureDescriptionMapping[product.name].map((feature) => (
                            <ListItem key={feature}>
                                <ListIcon color="green.200" as={CheckIcon} />
                                {feature}
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box justifySelf="flex-end">
                    <Flex w="full" justifyContent="space-between">
                        <Spacer />
                        <Button
                            fontWeight="bold"
                            disabled={product.name === paymentPlan}
                            onClick={() => handlePricingClick(price.id)}
                            colorScheme="green"
                            rightIcon={<FaArrowRight />}
                        >
                            Buy {product.name}
                        </Button>
                    </Flex>
                </Box>
            </Card>
        </WrapItem>
    );
};

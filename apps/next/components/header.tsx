import {
    HStack,
    Avatar,
    Flex,
    Box,
    Link,
    WrapItem,
    Button,
    Center,
    Wrap,
    useBreakpointValue,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    useColorMode,
    IconButton,
    Heading,
    Image,
    chakra,
    LinkBox,
    LinkOverlay,
    SimpleGrid,
    useBreakpoint,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './header.module.css';
import React from 'react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAdmin } from '../util/hooks/useAdmin';
import favicon from '@next/public/favicon.png';
import { FaTwitter } from 'react-icons/fa';

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
    const { data: session, status } = useSession({ required: false });
    const loading = status === 'loading';
    const [isAdmin] = useAdmin({ required: false });
    const { colorMode, toggleColorMode } = useColorMode();
    const breakpoint = useBreakpoint();
    const breakpointValue = useBreakpointValue(
        {
            base: {
                mobile: true,
                gridColumns: 2,
                gridSpacing: 4,
            },
            sm: {
                mobile: true,
                gridColumns: 2,
                gridSpacing: 4,
            },
            md: {
                mobile: true,
                gridColumns: 2,
                gridSpacing: 6,
            },
            lg: {
                gridColumns: 3,

                gridSpacing: 6,
            },
            xl: {
                gridColumns: 3,

                gridSpacing: 10,
            },
        },
        'base'
    );

    return (
        <header>
            <noscript>
                <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
            </noscript>
            <Center w="full" className={styles.signedInStatus}>
                <Flex
                    h="16"
                    maxH="16"
                    className={`nojs-show ${!session && loading ? styles.loading : styles.loaded}`}
                    p={['2', '2', '4', '4']}
                    px={['2', '2', '4', '4']}
                    alignItems="center"
                    justify="space-evenly"
                    w={['full', 'full', 'full', '75vw']}
                >
                    <SimpleGrid columns={breakpointValue.gridColumns} spacing={breakpointValue.gridSpacing} h="100%" maxH="100%" w="full">
                        <Box maxH="10">
                            <LinkBox h="full">
                                <HStack height="100%">
                                    <Image alt="PulseBanner logo" src={favicon.src} height="10" width="10" />
                                    <Heading size="md" as={chakra.p}>
                                        <NextLink href="/" passHref>
                                            <LinkOverlay href="/">PulseBanner</LinkOverlay>
                                        </NextLink>
                                    </Heading>
                                </HStack>
                            </LinkBox>
                        </Box>
                        {!breakpointValue.mobile && (
                            <Center id="nav-links" fontSize="lg">
                                <Wrap spacing={['2', '4', '8', '12']}>
                                    <WrapItem>
                                        <NextLink href="/features" passHref>
                                            <Link>Features</Link>
                                        </NextLink>
                                    </WrapItem>
                                    <WrapItem>
                                        <NextLink href="/banner" passHref>
                                            <Link>Banner</Link>
                                        </NextLink>
                                    </WrapItem>
                                    <WrapItem>
                                        <NextLink href="/pricing" passHref>
                                            <Link>Pricing</Link>
                                        </NextLink>
                                    </WrapItem>
                                </Wrap>
                            </Center>
                        )}

                        <Flex experimental_spaceX="2" alignItems="center" justifySelf="flex-end">
                            <IconButton
                                size={breakpoint === 'base' ? 'sm' : 'md'}
                                aria-label="Toggle theme"
                                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                                onClick={toggleColorMode}
                            >
                                Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
                            </IconButton>
                            {!session && (
                                <Button
                                    as={Link}
                                    href={`/api/auth/signin`}
                                    className={styles.buttonPrimary}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        signIn('twitter');
                                    }}
                                    size={breakpoint === 'base' ? 'sm' : 'md'}
                                    colorScheme="twitter"
                                    leftIcon={<FaTwitter />}
                                >
                                    Sign in
                                </Button>
                            )}
                            {session && (
                                <Menu>
                                    <Avatar as={MenuButton} name={session.user.name} src={session.user.image} />
                                    <Portal>
                                        <MenuList>
                                            <NextLink href="/account" passHref>
                                                <MenuItem>Account</MenuItem>
                                            </NextLink>
                                            <MenuItem onClick={() => signOut({ redirect: false })}>Sign out</MenuItem>
                                            {isAdmin && (
                                                <NextLink href="/admin" passHref>
                                                    <MenuItem>Admin</MenuItem>
                                                </NextLink>
                                            )}
                                        </MenuList>
                                    </Portal>
                                </Menu>
                            )}
                        </Flex>
                    </SimpleGrid>
                </Flex>
            </Center>
            {breakpointValue.mobile && (
                <Center id="nav-links" fontSize="lg">
                    <Wrap spacing={['8', '16', '20', '24']}>
                        <WrapItem>
                            <NextLink href="/features" passHref>
                                <Link>Features</Link>
                            </NextLink>
                        </WrapItem>
                        <WrapItem>
                            <NextLink href="/banner" passHref>
                                <Link>Banner</Link>
                            </NextLink>
                        </WrapItem>
                        <WrapItem>
                            <NextLink href="/pricing" passHref>
                                <Link>Pricing</Link>
                            </NextLink>
                        </WrapItem>
                    </Wrap>
                </Center>
            )}
        </header>
    );
}

import {
    HStack,
    Avatar,
    Flex,
    Box,
    Link,
    WrapItem,
    Spacer,
    Button,
    Text,
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
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './header.module.css';
import React from 'react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useAdmin } from '../util/hooks/useAdmin';

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
    const { data: session, status } = useSession({ required: false });
    const loading = status === 'loading';
    const [isAdmin] = useAdmin({ required: false });
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <header>
            <noscript>
                <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
            </noscript>
            <Box className={styles.signedInStatus}>
                <Flex h="16" className={`nojs-show ${!session && loading ? styles.loading : styles.loaded}`} p={['2', '4']} alignItems="center">
                    <Wrap spacing={['2', '12']}>
                        <WrapItem>
                            <NextLink href="/" passHref>
                                <Link>Home</Link>
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
                    <Spacer />
                    <Flex experimental_spaceX="2" alignItems="center">
                        <IconButton size="md" aria-label="Toggle theme" icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />} onClick={toggleColorMode}>
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
                            >
                                Sign in
                            </Button>
                        )}
                        {session && (
                            <Menu>
                                <Avatar as={MenuButton} name={session.user.name} src={session.user.image} showBorder={[]} />
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
                </Flex>
            </Box>
        </header>
    );
}

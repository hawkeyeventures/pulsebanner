import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, Button, Center, Text, Link, Flex } from '@chakra-ui/react';
import { Account, Session } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { FaTwitter, FaCheck, FaTwitch } from 'react-icons/fa';

interface ConnectTwitchModalProps {
    onClose: () => void;
    isOpen: boolean;
    session: Session & { accounts?: { [key: string]: Account } };
}

export const ConnectTwitchModal: React.FC<ConnectTwitchModalProps> = ({ session, isOpen, onClose }) => {
    return (
        <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>Almost there!</Center>
                    <Center>Connect to Twitter to continue.</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalCloseButton />
                <ModalBody minH="32" h="32" pb="4">
                    <Flex h="full" direction="column" justifyContent="space-between">
                        <VStack>
                            <Button
                                onClick={
                                    session?.accounts?.twitter
                                        ? undefined
                                        : () =>
                                              signIn('twitter', {
                                                  callbackUrl: '/banner?modal=true',
                                              })
                                }
                                colorScheme="twitter"
                                leftIcon={<FaTwitter />}
                                rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}
                            >
                                Connect to Twitter
                            </Button>
                            {session && (
                                <Button
                                    onClick={() =>
                                        signIn('twitch', {
                                            callbackUrl: '/banner',
                                        })
                                    }
                                    colorScheme="twitch"
                                    leftIcon={<FaTwitch />}
                                    rightIcon={session?.accounts?.twitch ? <FaCheck /> : undefined}
                                >
                                    Connect to Twitch
                                </Button>
                            )}
                        </VStack>
                        <Center>
                            <Text fontSize="sm">
                                {'By signing up, you agree to our'} <Link>Terms</Link> and <Link>Privacy Policy</Link>
                            </Text>
                        </Center>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
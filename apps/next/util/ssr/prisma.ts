import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { StartupService } from './StartupService';

StartupService.onLoad();

declare global {
    // eslint-disable-next-line no-var
    var _prisma: PrismaClient | undefined;
}

var numClients = 0;

const createPrismaClient = () => {
    if (process.env.GITHUB_ACTIONS) {
        return new PrismaClient();
    }
    // console.log(process.env);
    logger.info('Creating new Prisma client...'); 
    numClients++;
    logger.info('Total clients: ' + numClients);
    return new PrismaClient();
};

// https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
const prisma = global._prisma || createPrismaClient() as PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;

if (process.env.NODE_ENV !== 'production') global._prisma = prisma;

export default prisma;

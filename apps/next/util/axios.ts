import axios, { AxiosError } from "axios";
import env from "./env";
import { logger } from "./logger";
import * as net from 'net';
import * as dns from 'dns';

export const twitchAxios = axios.create({
    baseURL: 'https://api.twitch.tv',
});

function resolve(hostname: string): Promise<string> {
    return new Promise((resolve, reject) => {
        dns.resolve(hostname, (err, addresses) => {
            if (err) {
                reject(err);
            } else {
                resolve(addresses[0]);
            }
        });
    });
}

twitchAxios.interceptors.request.use(function (config) {
    const url = new URL(config.url!);

    if (net.isIP(url.hostname)) {
        // Skip
        return config;
    } else {

        return resolve(url.hostname).then((result) => {
            config.headers = config.headers || {};
            config.headers.Host = url.hostname; // put original hostname in Host header

            url.hostname = result;
            config.url = new URL(url).toString();

            return config;
        });
    }
});

twitchAxios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error: AxiosError) {

    const errorLogs: string[] = ['Error occured during request (twitch axios)'];

    errorLogs.push(`${error.config.method?.toUpperCase()} ${error.config.url}`);
    errorLogs.push(`Error message: ${error.message}`);
    errorLogs.push(`Axios request config: ${JSON.stringify(error.config, null, 2)}`);

    logger.error('Error occured during request (twich axios)', { method: error.config.method, url: error.config.url, message: error.message, config: error.config });

    if (env.ENABLE_DISCORD_WEBHOOKS) {
        axios.post(env.DISCORD_ERROR_WEBHOOK_URL, {
            content: errorLogs.join('\n'),
        });
    }
});

export const localAxios = axios.create({
    baseURL: process.env.NEXTAUTH_URL
});

localAxios.interceptors.response.use(undefined, (error: AxiosError) => {
    logger.error('Error occured during request (local)', { method: error.config.method, url: error.config.url, message: error.message });
})

export const remotionAxios = axios.create({
    baseURL: env.REMOTION_URL
});

remotionAxios.interceptors.response.use((response) => {
    // Do something with response data
    return response;
}, (error: AxiosError) => {
    logger.error('Error occured during request (remotion)', { method: error.config.method, url: error.config.url, message: error.message });
});

import React from 'react';
import { Img } from 'remotion';
import { LayerComponent } from '../LayerComponent';
import './fonts.module.css';
import arrow from '../../assets/arrow.jpeg';

type ImLiveProps = {
    text?: string;
    thumbnailUrl: string;
    fontColor?: string;
};

export const ImLive: React.FC<ImLiveProps> = ({ thumbnailUrl = 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg', text, fontColor = 'black' }) => {
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'scroll', fontFamily: 'Inter' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
                <div style={{ width: '100%', alignItems: 'flex-end' }}>
                    <h1 style={{ color: fontColor, fontSize: '86px', width: '100%', textAlign: 'center', alignItems: 'flex-end', margin: 0 }}>{text}</h1>
                </div>
                <div style={{ display: 'flex', width: '100%', height: 'min', alignItems: 'bottom', justifyContent: 'flex-end', justifyItems: 'baseline' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignSelf: 'flex-end',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <Img
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            src={typeof arrow === 'string' ? arrow : (arrow as any).src}
                            style={{
                                transform: 'scaleX(-1) rotate(180deg) translate(0%, 10%)',
                                filter: fontColor === 'white' ? 'brightness(0) invert(1)' : '',
                            }}
                        />

                        <div
                            style={{
                                maxWidth: '33%',
                                margin: '0.4em',
                                background: 'rgb(145, 71, 255)',
                                border: '0.4em solid rgb(145, 71, 255)',
                                alignItems: 'flex-end',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'Inter',
                                    background: 'red',
                                    borderRadius: '0.2em',
                                    color: 'white',
                                    width: 'min-content',
                                    height: 'min-content',
                                    padding: '0.1em',
                                    textAlign: 'center',
                                    position: 'absolute',
                                    margin: '0.7em',
                                    fontSize: '1em',
                                }}
                            >
                                LIVE
                            </div>
                            <Img src={thumbnailUrl} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const sh = {
    component: ImLive,
    defaultProps: {
        thumbnailUrl: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_moistcr1tikal-440x248.jpg',
    },
    name: "I'm Live!",
    description: "Let your audience know you're live with this awesome live-upating banner.",
} as LayerComponent<typeof ImLive>;

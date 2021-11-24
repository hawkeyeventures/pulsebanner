import React from 'react';

export type LayerFormProps<P extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = {
    props: React.ComponentProps<P>;
    setProps: (props: React.ComponentProps<P>) => void;
    showPricing: (force?: boolean) => boolean;
    availableFeature?: boolean;
};

export type LayerForm<P extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = React.FC<LayerFormProps<P>>;

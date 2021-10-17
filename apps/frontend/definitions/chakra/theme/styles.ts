import { ThemeOverride } from "@chakra-ui/react";
// Do not remove below import, it's needed to make sure @emotion/react is included in the generated package.json file when we build our app for production.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Global } from "@emotion/react";

type GlobalStyles = Pick<ThemeOverride, "styles">;

export default {
    styles: {
        global: {
        },
    },
} as GlobalStyles;

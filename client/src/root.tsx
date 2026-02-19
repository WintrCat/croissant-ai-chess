import { MantineProvider } from "@mantine/core";
import {
    Outlet,
    Scripts,
    ScrollRestoration,
    Meta,
    Links
} from "react-router";

import "@mantine/core/styles.css";

function App() {
    return <html>
        <head>
            <title>AI Chess</title>

            <link rel="icon" href="/favicon.ico"/>

            <Meta/>
            <Links/>
        </head>

        <body>
            <MantineProvider>
                <Outlet/>
            </MantineProvider>

            <ScrollRestoration/>
            <Scripts/>
        </body>
    </html>;
}

export default App;
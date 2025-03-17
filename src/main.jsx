import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@radix-ui/themes/styles.css";
import "./index.css";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import { config } from "./config/wallet-connection/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { AppProvider } from "./contexts/appContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Account from "./components/Pages/Account";
import Layout from "./components/Layout";

const router = createBrowserRouter([
    {
        path:"/",
        element:<Layout />,
        children: [
            {
                path: "/",
                element: <App/>
            },
            {
                path: "/account",
                element: <Account />
            }
        ]
    },
   
]);

let queryClient;

const getQueryClient = () => {
    if (!queryClient) {
        queryClient = new QueryClient();
    }

    return queryClient;
};

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Theme>
            <WagmiProvider config={config}>
                <QueryClientProvider client={getQueryClient()}>
                    <AppProvider>
                        <RouterProvider router={router} />
                    </AppProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </Theme>
    </StrictMode>
);

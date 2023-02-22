import { signIn, signOut, useSession } from "next-auth/react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";

import EarthIcon from "../svg/components/EarthIcon";
import Link from "next/link";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import MetaMaskIcon from "../svg/components/MetaMaskIcon";
import React from "react";
import SearchIcon from "../svg/components/SearchIcon";
import axios from "axios";
import { useRouter } from "next/router";

function Header({ words }) {
  const { data: session } = useSession();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push, asPath } = useRouter();

  const handleAuth = async () => {
    if (isConnected) await disconnectAsync();

    const { account, chain } = await connectAsync({
      connector: new MetaMaskConnector(),
    });

    const userData = { address: account, chain: chain.id, network: "evm" };

    const { data } = await axios.post("/api/auth/request-message", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const message = data.message;
    const signature = await signMessageAsync({ message });

    // redirect user after success authentication to '/user' page
    const { url } = await signIn("credentials", {
      message,
      signature,
      redirect: false,
    });
    /**
     * instead of using signIn(..., redirect: "/user")
     * we get the url from callback and push it to the router to avoid page refreshing
     */
    push(url);
  };

  const renderWalletAddress = () => {
    const firstSixSymbols = session.user.address.slice(0, 6);
    const lastFourSymbols = session.user.address.slice(38, 42);

    return `${firstSixSymbols}...${lastFourSymbols}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-[401]">
      <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5  dark:bg-gray-900">
        <div className="container flex justify-between items-center mx-auto">
          <Link href="/" className="flex items-center">
            <EarthIcon />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Earthverse
            </span>
          </Link>

          {asPath === "/nftMarketplace" ? null : (
            <Link href="/nftMarketplace" className="dark:text-white">
              Marketplace
            </Link>
          )}

          {words && (
            <div className="flex">
              <div className="hidden relative md:block w-[40rem]">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <SearchIcon />
                  <span className="sr-only">Search icon</span>
                </div>
                <input
                  type="text"
                  id="search-navbar"
                  defaultValue={words}
                  className="block p-2 pl-10 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="justify-between items-center flex flex-row-reverse  md:order-1">
            {!session ? (
              <div>
                <button
                  type="button"
                  onClick={handleAuth}
                  className=" text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-2.5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                >
                  <div className="inline-flex">
                    <span className="px-2">Login with Metamask</span>
                    <MetaMaskIcon />
                  </div>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signOut()}
                className="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-2.5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
              >
                <span className="px-2">{renderWalletAddress()}</span>
                <span className="px-2">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;

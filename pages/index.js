import "leaflet/dist/leaflet.css";

import Head from "next/head";
import Map from "../components/map";
import React from "react";

export default function Home() {
  return (
    <>
      <Head>
        <title>Earthverse</title>
        <meta name="description" content="The Metaverse" />
        <link rel="icon" href="/earth-icon.svg" />
      </Head>
      <Map />
    </>
  );
}

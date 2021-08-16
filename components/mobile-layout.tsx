import Head from "next/head";
import React from "react";

export default function MobileLayout({ children }) {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <title>WEB Network</title>
      </Head>
      <div className="banner bg-bepro-blue mb-4">
        <div className="d-flex justify-content-start">
          <div className="d-flex">
            <img
              className="logo"
              src="https://64.media.tumblr.com/3cf2d2b58643cb6f46b42a652771b73b/e8afc16b16e16514-bc/s250x400/191e77982d8901585030f596d3e90935d42099ed.png"
              alt=""
            />
          </div>
        </div>
        {children}
      </div>
    </>
  );
}

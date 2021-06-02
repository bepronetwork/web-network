import { GetStaticProps } from 'next'
import React from 'react';
import { useEffect, useState } from 'react';

export default function MainNav() {
    return (
        <div className="main-nav">
            <div className="d-flex justify-content-between align-center">
                <div className="d-flex">
                    <a href="/">
                        <img
                            className="logo"
                            src="https://64.media.tumblr.com/3cf2d2b58643cb6f46b42a652771b73b/e8afc16b16e16514-bc/s250x400/191e77982d8901585030f596d3e90935d42099ed.png"
                            alt=""
                        />
                    </a>
                    <ul className="nav-links">
                        <li><a href="/developers">Developers</a></li>
                        <li><a href="/council">Council</a></li>
                        <li><a href="/oracle">Oracle</a></li>
                    </ul>
                </div>
                <div className="d-flex flex-row align-center">
                    <button className="btn btn-md btn-trans mr-2">+ Create issue</button>
                    <button className="btn btn-md btn-white">Connect <i className="ico-metamask ml-1"></i></button>
                </div>
            </div>
        </div>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}
    }
}

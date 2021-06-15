import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function IssueAvatars() {
    return (
        <div className="avatar-list mr-1">
            <img className="avatar circle-3"
                src="https://randomuser.me/api/portraits/men/78.jpg"
                alt=""
            />
            <img className="avatar circle-3"
                src="https://uifaces.co/our-content/donated/gPZwCbdS.jpg"
                alt=""
            />
            <img className="avatar circle-3"
                src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg"
                alt=""
            />
        </div>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}
    }
}

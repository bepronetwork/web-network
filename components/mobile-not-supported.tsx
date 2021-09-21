import MobileInformation from '@components/mobile-information';
import React from 'react';
import BeproLogo from '@assets/icons/bepro-logo';

export default function MobileNotSupported() {
  return <>
    <div/>
    <div className="bg-primary d-block text-center pt-5" style={{height: `100vh`}}>
      <BeproLogo aria-hidden={true} />
    </div>
    <MobileInformation />
    </>
}

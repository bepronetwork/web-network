import {memo} from 'react';

function CrossArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1.88889L5.70588 6.33333M12.2941 1H17V5.44444L12.2941 1ZM1 16.1111L16.2471 1.71111L1 16.1111ZM17 12.5556V17H12.2941L17 12.5556ZM11.3529 11.6667L16.1529 16.2L11.3529 11.6667Z" stroke="#4250E4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default memo(CrossArrow);

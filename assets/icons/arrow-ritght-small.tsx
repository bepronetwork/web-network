import { SVGProps } from "react";

const ArrowRightSmall: React.FC = (props:  SVGProps<SVGSVGElement>) => {
    return (
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.231804 0.359821C0.585368 -0.0644551 1.21593 -0.121779 1.64021 0.231785L7.64021 5.23178C7.8682 5.42178 8.00002 5.70323 8.00002 6.00001C8.00002 6.29679 7.8682 6.57823 7.64021 6.76823L1.64021 11.7682C1.21593 12.1218 0.585368 12.0645 0.231804 11.6402C-0.12176 11.2159 -0.0644362 10.5853 0.359841 10.2318L5.43798 6.00001L0.359841 1.76823C-0.0644362 1.41466 -0.12176 0.784099 0.231804 0.359821Z" fill="white"/>
        </svg>
    );
}

export default ArrowRightSmall;

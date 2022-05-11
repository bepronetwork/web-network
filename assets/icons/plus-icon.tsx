import {memo} from 'react';

function PlusIcon() {
  return <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 7C14 7.55228 13.5523 8 13 8H9C8.44772 8 8 8.44772 8 9V13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13V9C6 8.44772 5.55228 8 5 8H1C0.447715 8 0 7.55228 0 7C0 6.44772 0.447715 6 1 6H5C5.55228 6 6 5.55228 6 5V1C6 0.447715 6.44772 0 7 0C7.55228 0 8 0.447715 8 1V5C8 5.55228 8.44772 6 9 6H13C13.5523 6 14 6.44772 14 7Z" fill="white"/>
  </svg>
}

export default memo(PlusIcon);

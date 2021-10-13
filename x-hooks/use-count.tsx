import {useState} from 'react';
import {useRouter} from 'next/router';

export default function useCount() {
  const [count, setCount] = useState(0);

  return {count, setCount};
}

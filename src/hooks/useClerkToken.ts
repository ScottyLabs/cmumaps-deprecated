import { useSession } from '@clerk/nextjs';

import { useEffect, useState } from 'react';

const useClerkToken = () => {
  const { session, isLoaded } = useSession();
  const [token, setToken] = useState<string | null | undefined>(null);

  useEffect(() => {
    (async () => {
      const session_token = await session?.getToken();
      setToken(session_token);
    })();
  }, [isLoaded, session]);

  return token;
};

export default useClerkToken;

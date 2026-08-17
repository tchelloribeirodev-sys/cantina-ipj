import { useEffect, useState } from 'react';

// Reflete o estado de conexão do navegador (navigator.onLine), atualizado em
// tempo real pelos eventos "online"/"offline". Útil em locais com internet
// instável (ex.: wi-fi de acampamento), pra avisar o usuário e evitar que
// ele perca o que estava digitando ao tentar salvar sem conexão.
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

import { Box, Typography } from '@mui/material';
import { WifiOffOutlined } from '@mui/icons-material';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        bgcolor: '#B42318',
        color: 'white',
        px: 2,
        py: 0.75,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <WifiOffOutlined fontSize="small" />
      <Typography variant="body2" fontWeight={700}>
        Sem conexão com a internet — as alterações não serão salvas até a conexão voltar.
      </Typography>
    </Box>
  );
}

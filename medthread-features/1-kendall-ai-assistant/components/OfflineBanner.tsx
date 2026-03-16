import { CloudOff, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/app/context/AppContext';

export const OfflineBanner = () => {
  const { isOnline } = useApp();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gray-700 text-white px-4 py-3 flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">You're offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

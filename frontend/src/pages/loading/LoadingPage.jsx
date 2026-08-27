import { motion } from "framer-motion";
import { Boxes } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-2xl"
        >
          <Boxes size={38} strokeWidth={1.8} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-2xl font-bold text-white"
        >
          StockFlow
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-sm text-slate-400"
        >
          Inventory Intelligence Platform
        </motion.p>

        <div className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 rounded-full bg-white"
          />
        </div>

      </div>
    </div>
  );
};

export default LoadingPage;
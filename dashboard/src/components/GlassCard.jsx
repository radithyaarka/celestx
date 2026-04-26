import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm ${className}`}
    >
        {children}
    </motion.div>
);
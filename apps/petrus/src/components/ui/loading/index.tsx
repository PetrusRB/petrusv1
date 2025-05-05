import { motion } from 'framer-motion';

interface LoadingOverlayProps {
    message: string;
}

// Loading overlay component
const LoadingOverlay = ({ message }: LoadingOverlayProps) => (
    <motion.div
        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
            duration: 0.9,
        }}
    >
        <div className="bg-white p-5 rounded-xl shadow-lg">
            <p className="text-lg text-gray-800 font-semibold"><span className="loading loading-spinner text-warning"></span>
                {message}</p>
        </div>
    </motion.div>
);

export { LoadingOverlay };
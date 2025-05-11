'use client'
import { Hero } from "@/components/ui/homehero";
import { motion } from 'framer-motion';

// Command Page for listing all commands of bot.
export default function CommandPage() {
    return (
        <>
            <div className="flex min-h-screen justify socialist-center items-center px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.9 },
                        scale: { duration: 0.9 },
                    }}
                    className="w-full max-w-7xl py-8 sm:py-12 mx-auto"
                    aria-label="Home screen content"
                >
                    <Hero>
                        {/* Title */}
                        <h2 className="text-3xl md:text-3xl font-extrabold mb-4 transition-colors duration-300 hover:text-[#FFC817]">
                            Command List
                        </h2>
                        <div className="join join-vertical bg-base-100">
                            <div className="collapse collapse-arrow join-item border-base-300 border">
                                <input type="radio" name="my-accordion-4" defaultChecked />
                                <div className="collapse-title font-semibold">How do I create an account?</div>
                                <div className="collapse-content text-sm">Click the "Sign Up" button in the top right corner and follow the registration process.</div>
                            </div>
                            <div className="collapse collapse-arrow join-item border-base-300 border">
                                <input type="radio" name="my-accordion-4" />
                                <div className="collapse-title font-semibold">I forgot my password. What should I do?</div>
                                <div className="collapse-content text-sm">Click on "Forgot Password" on the login page and follow the instructions sent to your email.</div>
                            </div>
                            <div className="collapse collapse-arrow join-item border-base-300 border">
                                <input type="radio" name="my-accordion-4" />
                                <div className="collapse-title font-semibold">How do I update my profile information?</div>
                                <div className="collapse-content text-sm">Go to "My Account" settings and select "Edit Profile" to make changes.</div>
                            </div>
                        </div>
                    </Hero>
                </motion.div>
            </div>
        </>
    )
}
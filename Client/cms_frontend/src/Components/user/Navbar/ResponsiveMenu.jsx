import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavbarMenu } from "../../../mockData/data";

const ResponsiveMenu = ({ open, setOpen }) => {
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && open) {
                setOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [open, setOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && open) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [open, setOpen]);

    return (
        <AnimatePresence mode="wait">
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 0.3 }}
                    className="fixed left-0 w-full h-screen z-40 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        exit={{ y: -100 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-[#5e4a3a] text-white py-8 px-8 rounded-b-3xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                     

                            <ul className="flex flex-col gap-4">
                                {NavbarMenu.map((item, index) => (
                                    <motion.li
                                        key={item.id}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <a
                                            href={item.link}
                                            className="block text-xl font-semibold uppercase py-3 px-4 
                                                     hover:text-[#9aac7f] transition-all duration-300
                                                     hover:bg-white hover:bg-opacity-10 rounded-lg"
                                            onClick={() => setOpen(false)}
                                        >
                                            {item.title}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="mt-8 flex flex-col gap-4">
                                <button
                                    className="py-3 px-6 border-2 border-[#9aac7f] text-[#9aac7f] 
                                             rounded-full hover:bg-[#9aac7f] hover:text-white 
                                             transition-all duration-300 font-semibold"
                                    onClick={() => setOpen(false)}
                                >
                                    Sign in
                                </button>
                                <button
                                    className="py-3 px-6 bg-[#9aac7f] text-white rounded-full 
                                             hover:bg-white hover:text-[#5e4a3a] transition-all 
                                             duration-300 font-semibold shadow-lg"
                                    onClick={() => setOpen(false)}
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResponsiveMenu;

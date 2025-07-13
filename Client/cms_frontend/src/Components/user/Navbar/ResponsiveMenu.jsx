import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavbarMenu } from "../../../mockData/data";

const ResponsiveMenu = ({ open, setOpen, onSignInClick, onSignUpClick }) => {
    const handleMenuItemClick = () => {
        setOpen(false);
    };

    const handleSignInClick = () => {
        onSignInClick();
        setOpen(false);
    };

    const handleSignUpClick = () => {
        onSignUpClick();
        setOpen(false);
    };

    return (
        <AnimatePresence mode="wait">
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 w-full bg-[#f0f0e8] shadow-md z-40 md:hidden rounded-3xl"
                >
                    <div className="container py-6">
                        <ul className="flex flex-col gap-4 mb-6">
                            {NavbarMenu.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={item.link}
                                        onClick={handleMenuItemClick}
                                        className="block py-2 px-4 text-[#5e4a3a] hover:text-[#9aac7f] 
                                                 font-semibold transition-all duration-300 hover:bg-[#9aac7f]/10 
                                                 rounded-lg"
                                    >
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col gap-3 px-4">
                            <button
                                onClick={handleSignInClick}
                                className="w-full py-3 text-[#5e4a3a] hover:text-[#9aac7f] 
                                         font-semibold transition-all duration-300 hover:bg-[#9aac7f]/10 
                                         rounded-lg border border-[#5e4a3a] hover:border-[#9aac7f]"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={handleSignUpClick}
                                className="w-full py-3 bg-[#9aac7f] text-white rounded-lg 
                                         hover:bg-[#5e4a3a] transition-all duration-300 
                                         shadow-md hover:shadow-lg font-semibold"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResponsiveMenu;

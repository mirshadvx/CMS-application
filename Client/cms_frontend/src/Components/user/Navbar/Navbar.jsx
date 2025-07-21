import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NavbarMenu } from "../../../mockData/data";
import { IoMenu, IoClose } from "react-icons/io5";
import ResponsiveMenu from "./ResponsiveMenu";
import SignIn from "../auth/SignIn";
import SignUp from "../auth/SignUp";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSwitchToSignIn = () => {
        setShowSignIn(true);
        setShowSignUp(false);
    };

    const handleSwitchToSignUp = () => {
        setShowSignUp(true);
        setShowSignIn(false);
    };

    const handleCloseModals = () => {
        setShowSignIn(false);
        setShowSignUp(false);
    };

    const handleOpenSignIn = () => {
        setShowSignIn(true);
        setShowSignUp(false);
    };

    const handleOpenSignUp = () => {
        setShowSignUp(true);
        setShowSignIn(false);
    };

    return (
        <>
            <nav className="bg-[#f0f0e8] shadow-md relative z-50">
                <div className="container flex justify-between items-center py-4">
                    <div className="text-2xl flex items-center gap-2 font-bold uppercase">
                        <p className="text-[#5e4a3a] hover:text-[#9aac7f] transition-colors duration-300">Logo</p>
                    </div>
                    <div className="hidden md:block">
                        <ul className="flex items-center gap-8">
                            {NavbarMenu.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        to={item.link}
                                        className="inline-block py-2 px-4 text-[#5e4a3a] hover:text-[#9aac7f] font-semibold transition-all duration-300 hover:scale-105 border-b-2 border-transparent"
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={handleOpenSignIn}
                            className="px-4 py-2 text-[#5e4a3a] hover:text-[#9aac7f] font-semibold transition-all duration-300 hover:scale-105"
                        >
                            Sign in
                        </button>
                        <button
                            onClick={handleOpenSignUp}
                            className="px-6 py-2 bg-[#9aac7f] text-white rounded-full hover:bg-[#5e4a3a] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                    <div className="md:hidden" onClick={() => setOpen(!open)}>
                        {open ? (
                            <IoClose className="text-4xl text-[#5e4a3a] hover:text-[#9aac7f] transition-colors duration-300" />
                        ) : (
                            <IoMenu className="text-4xl text-[#5e4a3a] hover:text-[#9aac7f] transition-colors duration-300" />
                        )}
                    </div>
                </div>
            </nav>
            <ResponsiveMenu
                open={open}
                setOpen={setOpen}
                onSignInClick={handleOpenSignIn}
                onSignUpClick={handleOpenSignUp}
            />
            {showSignIn && <SignIn onClose={handleCloseModals} onSwitchToSignUp={handleSwitchToSignUp} />}
            {showSignUp && <SignUp onClose={handleCloseModals} onSwitchToSignIn={handleSwitchToSignIn} />}
        </>
    );
};

export default Navbar;

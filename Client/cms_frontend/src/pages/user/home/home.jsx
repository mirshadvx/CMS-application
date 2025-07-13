import React from "react";
import Navbar from "../../../Components/user/Navbar/Navbar";

const Home = () => {
    return (
        <div className="min-h-screen bg-[#f0f0e8]">
            <Navbar />

            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-[#5e4a3a] mb-6">Turn ideas into stories.</h1>
                    <p className="text-xl text-[#9aac7f] mb-8 max-w-2xl mx-auto">
                        Write, share, and connect through powerful contents.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            className="px-8 py-3 bg-[#9aac7f] text-white rounded-full 
                                         hover:bg-[#5e4a3a] transition-all duration-300 hover:scale-105
                                         shadow-lg hover:shadow-xl font-semibold"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

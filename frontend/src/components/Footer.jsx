import React from 'react';
import { Bird } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto pt-12 pb-8 border-t border-gray-800/30">
            <div className="flex flex-col md:flex-row items-center justify-between opacity-70 hover:opacity-100 transition-opacity duration-500">

                {/* Brand & Copyright */}
                <div className="flex items-center space-x-2">
                    <Bird size={16} className="text-indigo-400" />
                    <span className="text-sm font-semibold tracking-wider text-white">KESTREL</span>
                    <span className="text-xs text-gray-400 ml-2">
                        © {currentYear} Celestial Systems. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

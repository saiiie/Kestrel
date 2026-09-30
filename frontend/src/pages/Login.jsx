import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import CustomCursor from '../components/CustomCursor';
import Footer from '../components/Footer';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address with a domain.');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05050A] flex flex-col justify-between p-4">
            <CustomCursor />

            {/* Centered Form Area */}
            <div className="flex-grow flex flex-col justify-center items-center py-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Kestrel</h1>
                    <p className="text-gray-400 text-xs">Welcome Back — Access your crypto dashboard</p>
                </div>

                <div className="w-full max-w-md bg-[#11131C] rounded-2xl border border-gray-800 p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Log In</h2>



                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#05050A] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="example@kestrel.io"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-medium text-gray-400">Password</label>
                                <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Forgot Password?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#05050A] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors tracking-widest"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <div>
                            <div className="mb-2 h-4 flex items-end justify-start">
                                {error && (
                                    <span className="text-rose-400 text-[10px] italic text-left">
                                        {error}
                                    </span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="cursor-pointer w-full bg-white hover:bg-gray-100 text-black font-semibold rounded-lg py-3 text-sm transition-colors flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Log In'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Don't have an account? <Link to="/register" className="text-white hover:underline font-medium">Sign Up</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center space-x-2 text-[10px] text-gray-600 tracking-widest uppercase">
                    <span>STAY ALERT WITH KESTREL.</span>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full px-4 md:px-8">
                <Footer />
            </div>
        </div>
    );
};

export default Login;

import { useAuth } from '../context/useAuth';

const Topbar = () => {
    const { user } = useAuth();
    const firstName = user?.username ? user.username.split(' ')[0] : 'Observer';

    return (
        <header className="h-20 px-8 flex items-center justify-end border-b border-gray-800/20 bg-[#090A11]">
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-300">
                    Welcome back, <span className="text-white font-semibold">{firstName}</span>
                </span>
            </div>
        </header>
    );
};

export default Topbar;
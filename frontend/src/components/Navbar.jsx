import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { CircleUser, LogOut, Plus, Sun, Moon, Calendar, User, Menu, UserStar } from 'lucide-react'

const Navbar = () => {
    const [theme, setTheme] = useState("light");
    const { user, logout } = useAuthStore();
    const location = useLocation();

    // Initialize theme
    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const storedTheme = localStorage.getItem("theme");
        const initialTheme = storedTheme || (prefersDark ? "business" : "light");

        setTheme(initialTheme);
        document.documentElement.setAttribute("data-theme", initialTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "business" ? "light" : "business";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        // Sticky Header with Blur Effect
        <div className="navbar relative z-50 bg-base-100/40 backdrop-blur-md border-b border-base-200/20  h-16 transition-all duration-300 rounded-b-2xl rounded-t-none flex justify-between items-center">

            {/* --- Left: Logo --- */}
            <div className="">
                <Link to="/" className="flex items-center gap-2 group">
                    <img
                        className='w-11 h-8 md:w-13 md:h-10 transition-transform group-hover:scale-105'
                        src='https://res.cloudinary.com/mern288/image/upload/v1772400983/logoAzul-removebg-preview-removebg-preview_b6xrf7.png'
                        alt="Logo Santa Cruz"
                    />
                    <span className="text-xl md:text-2xl font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">
                        Organiza<span className="text-primary">Estudos</span>
                    </span>
                </Link>
            </div>

            {/* --- Center: Desktop Menu (Optional - can add links here) --- */}


            {/* --- Right: Actions --- */}
            <div className=" flex  items-center gap-2 md:gap-4">

                {/* Theme Toggle */}
                <button className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-primary" onClick={toggleTheme}>
                    {theme === 'business' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user ? (
                    <>

                        {/* User Dropdown */}
                        <div className="dropdown dropdown-end ">
                            <div tabIndex={0} role="button" className=" btn btn-ghost btn-circle avatar ring-2 ring-base-200/20 ring-offset-2 ring-offset-base-100/20 hover:ring-primary transition-all">
                                <div className="w-10 rounded-full ">
                                    {user.avatar ? (
                                        <img alt="User Avatar" src={user.avatar} />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="text-lg font-bold">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ul tabIndex={0} className=" mt-3 z-50 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100  rounded-2xl w-60 border border-base-200">
                                {/* User Info Header */}
                                <li className="px-4 py-3 border-b border-base-200 mb-2 pointer-events-none">
                                    <p className="font-bold text-base-content truncate">{user.name || "Usuário"}</p>
                                    <p className="text-xs text-base-content/50 truncate">{user.email}</p>
                                </li>

                                {/* Mobile Only Links */}
                                {user.isAdmin && (
                                    <li className="">
                                        <Link className='py-3' to="/admin">
                                            <span className="flex items-center gap-2"><UserStar size={16} /> Painel Admin</span>
                                        </Link>
                                    </li>
                                )}

                                <li>
                                    <Link to="/perfil" className="flex justify-between items-center py-3">
                                        <span className="flex items-center gap-2"><User size={16} /> Meu Perfil</span>
                                    </Link>
                                </li>

                                <div className="divider my-1"></div>

                                <li>
                                    <button onClick={logout} className="text-error hover:bg-error/10 flex gap-2 py-3">
                                        <LogOut size={16} /> Sair
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                ) : (
                    /* Guest View */
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="btn btn-ghost btn-sm">
                            Entrar
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm rounded-full px-5 shadow-md">
                            Cadastrar
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar
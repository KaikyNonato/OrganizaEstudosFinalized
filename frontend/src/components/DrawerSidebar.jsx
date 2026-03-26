import React from 'react'
import { Clock, BookOpenText, RotateCcw, Calendar, Home, PanelLeftOpen, Goal } from 'lucide-react'
import { NavLink, useLocation, Outlet } from 'react-router-dom' // Substituímos Link por NavLink

const DrawerSidebar = () => {
    const location = useLocation()

    const getTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard'
            case '/materias': return 'Matérias'
            case '/revisoes': return 'Revisões'
            case '/cronograma': return 'Cronograma'
            case '/pomodoro': return 'Pomodoro'
            case '/metas' : return 'Metas'
            default: return 'OrganizaEstudos'
        }
    }

    // Função auxiliar para injetar a classe 'active' do DaisyUI
    const navLinkClass = ({ isActive }) => `h-9 flex items-center gap-2 is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-primary text-primary-content' : ''}`

    return (
        <div className=''>
            <div className="drawer lg:drawer-open min-h-screen">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" defaultChecked={window.innerWidth >= 1024} />
                <div className="drawer-content overflow-visible">
                    {/* Navbar */}
                    <nav className="flex items-center bg-base-300 py-1.5">
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            {/* Sidebar toggle icon */}
                            <PanelLeftOpen size={17}></PanelLeftOpen>
                        </label>
                        <div className="px-4 font-bold text-3xl">{getTitle()}</div>
                    </nav>

                    {/* Page content here */}
                    <div className="p-4">
                        <Outlet />
                    </div>
                </div>

                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="pt-15 lg:pt-0 flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                        {/* Sidebar content here */}
                        <ul className="menu w-full grow flex flex-col gap-1">

                            {/* Cada item do menu deve ter sua própria <li> para o DaisyUI estilizar corretamente */}
                            <li >
                                <NavLink to='/' className={navLinkClass} data-tip="Dashboard">
                                    <Home size={17} />
                                    <span className="is-drawer-close:hidden">Dashboard</span>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to='/materias' className={navLinkClass} data-tip="Matérias">
                                    <BookOpenText size={17} />
                                    <span className="is-drawer-close:hidden ">Matérias</span>
                                </NavLink>
                            </li>

                            {/* Adicionei links provisórios para os outros itens. Atualize o 'to' conforme suas rotas */}
                            <li>
                                <NavLink to='/revisoes' className={navLinkClass} data-tip="Revisões">
                                    <RotateCcw size={17} />
                                    <span className="is-drawer-close:hidden">Revisões</span>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to='/metas' className={navLinkClass} data-tip="Revisões">
                                    <Goal size={17} />
                                    <span className="is-drawer-close:hidden">Metas</span>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to='/cronograma' className={navLinkClass} data-tip="Cronograma">
                                    <Calendar size={17} />
                                    <span className="is-drawer-close:hidden">Cronograma</span>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to='/pomodoro' className={navLinkClass} data-tip="Pomodoro">
                                    <Clock size={17} />
                                    <span className="is-drawer-close:hidden">Pomodoro</span>
                                </NavLink>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DrawerSidebar

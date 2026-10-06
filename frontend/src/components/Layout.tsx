import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import "./Layout.css";

function Layout() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    closeMenu();
  };

  return (
    <div className="app-layout">
      <header className="mobile-header">
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        <div className="mobile-logo">Cashly</div>
      </header>

      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          Cashly
          <button className="sidebar-close" onClick={closeMenu}>
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Главная
          </NavLink>

          <NavLink
            to="/transactions"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Операции
          </NavLink>

          <NavLink
            to="/categories"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Категории
          </NavLink>

          <NavLink
            to="/stats"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Статистика
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button" onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

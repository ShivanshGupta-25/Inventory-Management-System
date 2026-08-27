import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          <Link to="/">
            <Logo />
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Back to home
          </Link>

        </div>
      </header>

      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">
        {children}
      </main>

    </div>
  );
};

export default AuthLayout;
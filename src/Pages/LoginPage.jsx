import loginimage from "../assets/Images/galfar-cover.png";
import Login from "../Components/Login";

const LoginPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.75fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#031a3a] lg:block">
        <img
          src={loginimage}
          alt="Galfar Integrated Web Application platform overview"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#031a3a]/10 via-transparent to-[#031a3a]/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#031a3a]/45 to-transparent" />
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="relative w-full max-w-[430px] rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.3)] sm:p-10">
          <Login />
        </div>
      </section>
    </main>
  );
};

export default LoginPage;

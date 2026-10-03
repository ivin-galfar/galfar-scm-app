import loginimage from "../assets/Images/galfar-login-background-v4.png";
import Login from "../Components/Login";

const LoginPage = () => {
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[#06285b]">
      <img
        src={loginimage}
        alt="Galfar Integrated Web Application workflow"
        className="fixed inset-0 h-full w-full object-cover object-left lg:object-center"
      />

      <section className="relative z-10 flex min-h-dvh items-end justify-center px pb-5 pt-[42vh] sm:px-8 sm:pb-8 lg:items-center lg:justify-end lg:px-[clamp(3rem,6vw,3rem)] lg:py-10">
        <div className="relative box-border w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.75rem] border border-white/85 bg-white/90 p-6 shadow-[0_24px_70px_-22px_rgba(2,18,51,0.48)] sm:max-w-[380px] sm:p-8 lg:p-8">
          <div className="relative z-10">
            <Login />
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;

/* eslint-disable react/prop-types */
const DashboardStatusNav = ({ children }) => (
  <div className="relative min-w-0 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-3 before:bg-gradient-to-r before:from-white before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-5 after:bg-gradient-to-l after:from-white after:to-transparent">
    <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:thin]">
      <div className="flex min-w-max items-center gap-1 rounded-lg bg-slate-100/80 p-1 pr-4">
        {children}
      </div>
    </div>
  </div>
);

export default DashboardStatusNav;

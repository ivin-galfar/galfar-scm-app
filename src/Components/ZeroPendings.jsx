import { LuFileCheck2 } from "react-icons/lu";

const ZeroPendings = ({ message }) => {
  return (
    <div>
      {" "}
      <section
        className="
        text-center text-slate-600
        animate-[empty-state-enter_450ms_ease-out_both]
        motion-reduce:animate-none
      "
        role="status"
        aria-live="polite"
      >
        <div
          className="
          mx-auto grid size-16 place-items-center
          rounded-full bg-green-50 text-green-600
          animate-[icon-breathe_3s_ease-in-out_infinite]
          motion-reduce:animate-none
        "
          aria-hidden="true"
        >
          <LuFileCheck2 size={34} strokeWidth={1.7} />
        </div>

        <h2 className="mb-2 mt-4 text-lg font-semibold text-slate-900">
          You’re all caught up
        </h2>

        <p className="m-0 leading-relaxed">{message}</p>
      </section>
    </div>
  );
};

export default ZeroPendings;

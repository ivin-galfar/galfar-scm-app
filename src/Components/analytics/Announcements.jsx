import { LuBellRing } from "react-icons/lu";
import { GrSystem } from "react-icons/gr";
import { FaRocket } from "react-icons/fa";
import { GrUpdate } from "react-icons/gr";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "./ui";
import { GetAnnouncementsData } from "../../APIs/api";
import { useQuery } from "@tanstack/react-query";
import { formatDateDMY } from "../../Helpers/helperfunctions";

const Annoucements = (userInfo) => {
  const { data, isLoading } = useQuery({
    queryKey: ["anouncements", userInfo?.token],
    queryFn: () => GetAnnouncementsData(userInfo),
    enabled: !!userInfo,
  });

  const iconMap = {
    system: {
      icon: GrSystem,
      color: "green",
    },
    feature: {
      icon: FaRocket,
      color: "blue",
    },
    update: {
      icon: GrUpdate,
      color: "violet",
    },
  };

  return (
    <Card className="flex max-h-85  h-full flex-col shadow-sm">
      <CardHeader className="shrink-0 flex-row items-start justify-between gap-3 space-y-0 p-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md">
            <LuBellRing size={19} color="red" fill="red" />
          </span>
          <CardTitle>Announcements</CardTitle>
        </div>
      </CardHeader>
      <div className="w-full border-t border-border" />

      <CardContent className="flex h-fit min-h-10 flex-1 flex-col space-y-0 overflow-y-auto p-0">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex h-14 min-h-14 shrink-0 items-start gap-3 border-b border-border/70 px-4 py-2 last:border-b-0"
              >
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          : data?.map((announcement) => {
              const { icon: Icon, color } = iconMap[announcement?.tag] || {
                icon: GrUpdate,
                color: "text-red-600",
              };
              return (
                <article
                  key={announcement.id}
                  className="flex shrink-0 max-h-16  items-start gap-3 overflow-hidden border-b border-border/70 px-4 py-2 last:border-b-0"
                >
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/70 text-${color}-600`}
                  >
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="justify-between flex">
                      <h3 className="truncate text-xs font-semibold leading-4 text-foreground">
                        {announcement.name}
                      </h3>
                      <h3 className="truncate text-xs font-semibold leading-4 text-foreground">
                        {formatDateDMY(announcement.created_date)}
                      </h3>
                    </span>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                      {announcement.desc}
                    </p>
                  </div>
                </article>
              );
            })}
      </CardContent>
    </Card>
  );
};
export default Annoucements;

export type OrgRole =
  | "admin"
  | "director"
  | "manager"
  | "department_head"
  | "team_leader"
  | "employee";

export type OrgDepartment = {
  code: string;
  name: string;
  shortName: string;
  leader: string;
  teamLeader: string;
};

export const organizationalSummary = {
  title: "Байгууллагын хяналтын бүтэц",
  subtitle:
    "Захирал, менежер, хэлтсийн дарга, багийн удирдагчдын шаталсан хяналттай урсгал.",
  notes: [
    "Director 1 стратегийн удирдлага, баталгаа, тайлангийн хяналтыг төвлөрүүлнэ.",
    "Director 2 гүйцэтгэл, засвар, давтан шалгалтыг Director 1-тэй уялдуулан ажиллана.",
    "Manager нь 6 хэлтсийг нэг цэгээс уялдуулж, даалгавар болон хурлын урсгалыг хянадаг.",
    "Department Head болон Team Leader түвшинд доороос ирсэн биелэлт, асуудлыг шат дараалан дамжуулна.",
  ],
};

export const departments: OrgDepartment[] = [
  { code: "DEPT_FIN", name: "Finance Department", shortName: "Finance", leader: "Энх", teamLeader: "Оюу" },
  { code: "DEPT_HR", name: "Human Resources Department", shortName: "HR", leader: "Энх", teamLeader: "Сарнай" },
  { code: "DEPT_OPS", name: "Operations Department", shortName: "Operations", leader: "Энх", teamLeader: "Түвшин" },
  { code: "DEPT_SALES", name: "Sales Department", shortName: "Sales", leader: "Энх", teamLeader: "Нара" },
  { code: "DEPT_MKT", name: "Marketing Department", shortName: "Marketing", leader: "Энх", teamLeader: "Болд" },
  { code: "DEPT_TECH", name: "Technology Department", shortName: "Technology", leader: "Энх", teamLeader: "Ганзориг" },
];

export const organizationalPeople = {
  admin: { name: "Админ Бат", role: "admin" as const, department: "System Governance" },
  directors: [
    { name: "Батаар", label: "Director 1", role: "director" as const },
    { name: "Тэмүүжин", label: "Director 2", role: "director" as const },
  ],
  manager: { name: "Хэнбиш", label: "Manager", role: "manager" as const },
};

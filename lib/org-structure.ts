export type OrgRole =
  | "director1"
  | "director2"
  | "manager"
  | "department_head"
  | "team_leader";

export type OrgDepartment = {
  code: string;
  name: string;
  shortName: string;
  departmentHead: string;
  teamLeader: string;
};

export const organizationalSummary = {
  title: "Organizational Management Structure",
  subtitle:
    "Five-level chain: director1 -> director2 -> manager -> department_head -> team_leader.",
  notes: [
    "director1 has top-level authority and full visibility.",
    "director2 reports to director1.",
    "manager distributes tasks to department heads.",
    "department_head manages their team leader.",
    "team_leader executes tasks and reports upward.",
  ],
};

export const departments: OrgDepartment[] = [
  {
    code: "DEPT_MGMT",
    name: "Management Department",
    shortName: "Mgmt",
    departmentHead: "Head MGMT",
    teamLeader: "Leader MGMT",
  },
  {
    code: "DEPT_FIN",
    name: "Finance Department",
    shortName: "Finance",
    departmentHead: "Head FIN",
    teamLeader: "Leader FIN",
  },
  {
    code: "DEPT_HR",
    name: "Human Resources Department",
    shortName: "HR",
    departmentHead: "Head HR",
    teamLeader: "Leader HR",
  },
  {
    code: "DEPT_MKT",
    name: "Marketing Department",
    shortName: "Marketing",
    departmentHead: "Head MKT",
    teamLeader: "Leader MKT",
  },
  {
    code: "DEPT_TECH",
    name: "Technology Department",
    shortName: "Technology",
    departmentHead: "Head TECH",
    teamLeader: "Leader TECH",
  },
  {
    code: "DEPT_OPS",
    name: "Operations Department",
    shortName: "Operations",
    departmentHead: "Head OPS",
    teamLeader: "Leader OPS",
  },
];

export const organizationalPeople = {
  directors: [
    { name: "Director 1", label: "Director 1", role: "director1" as const },
    { name: "Director 2", label: "Director 2", role: "director2" as const },
  ],
  manager: { name: "Manager", label: "Manager", role: "manager" as const },
};

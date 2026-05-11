export type WorkflowRole =
  | "director_1"
  | "director_2"
  | "manager"
  | "department_head"
  | "leader";

export type WorkflowRoleCard = {
  id: WorkflowRole;
  label: string;
  title: string;
  accent: string;
  responsibilities: string[];
};

export type PlatformFeature = {
  title: string;
  description: string;
  emphasis: string;
};

export type MeetingTypeOption = {
  id: string;
  label: string;
  audienceMode: "all" | "selected" | "hybrid";
  description: string;
};

export const workflowRoles: WorkflowRoleCard[] = [
  {
    id: "director_1",
    label: "Director 1",
    title: "Батлах, comment бичих, эцсийн хяналт",
    accent: "bg-slate-950 text-white border-slate-800",
    responsibilities: [
      "Даалгаврыг харж, засвар шаардлагатай бол буцааж засуулах.",
      "Батлагдсан даалгаврыг биелэлт болгон авч, нэгтгэсэн үр дүнг шалгах.",
      "Биелэлт дээр засвар хэрэгтэй үед дахин засварлуулж, дараагийн шат руу шилжүүлэх.",
    ],
  },
  {
    id: "director_2",
    label: "Director 2",
    title: "Хоёр дахь шатны шалгалт, баталгаажуулалт",
    accent: "bg-violet-700/10 text-violet-950 border-violet-200",
    responsibilities: [
      "Даалгаврыг шалгаж, алдаа байвал засуулахаар буцаах.",
      "Биелэлтийг дахин шалгаж, шаардлагатай бол нэмэлт засвар нэхэх.",
      "Director 1-ээр дамжсан урсгалын эцсийн чанарын шүүлт болох.",
    ],
  },
  {
    id: "manager",
    label: "Manager",
    title: "Хурал, даалгавар, нэгтгэл, түгээлтийн төв цэг",
    accent: "bg-emerald-700/10 text-emerald-950 border-emerald-200",
    responsibilities: [
      "Хурлын үеэр voice бичиж, хурлын төрлөөр оролцогч сонгон хурал үүсгэх.",
      "Өөрийн даалгаврыг Director 1, дараа нь Director 2-оор шат дараалан шалгуулж батлуулах.",
      "Батлагдсан даалгаврыг хэлтсүүдэд хуваарилж, биелэлтийг нэгтгэн дахин захирлуудаар шалгуулах.",
    ],
  },
  {
    id: "department_head",
    label: "Department Head",
    title: "Хэлтсийн түвшний төлөвлөлт, хуваарилалт, нэгтгэл",
    accent: "bg-sky-700/10 text-sky-950 border-sky-200",
    responsibilities: [
      "Manager-тэй ижил логикоор өөрийн түвшний даалгаврыг шаталсан баталгаажуулалтаар явуулах.",
      "Батлагдсан ажлыг leader болон доод ажилтнуудад хуваарилах.",
      "Нэгтгэсэн биелэлтийг дахин дээрх түвшин рүү илгээж, засварын мөрийг хадгалах.",
    ],
  },
  {
    id: "leader",
    label: "Leader",
    title: "Ажилчдад даалгавар өгөх, биелэлт цуглуулах, буцаан тайлагнах",
    accent: "bg-amber-700/10 text-amber-950 border-amber-200",
    responsibilities: [
      "Ажилчдад даалгавар хуваарилж, PDF болон хугацаатайгаар хүргэх.",
      "Биелэлтийг авч нэгтгээд хэлтсийн даргад буцаан өгөх.",
      "Хоцорсон, дутуу биелэлтийг тусад нь тэмдэглэж дээд шатанд харуулах.",
    ],
  },
];

export const approvalFlow = [
  "Manager / Department Head даалгавар боловсруулна",
  "Director 1 шалгаж comment эсвэл засвар буцаана",
  "Director 2 дахин шалгаж баталгаажуулна",
  "Батлагдсан даалгавар хэлтэс, баг, ажилтнуудад хуваарилагдана",
  "Leader, Department Head биелэлтийг нэгтгэнэ",
  "Director 1 → Director 2 дээр биелэлтийн эцсийн баталгаа хийгдэнэ",
];

export const platformFeatures: PlatformFeature[] = [
  {
    title: "PDF даалгавар ба биелэлт",
    description: "Бүх түвшний хэрэглэгч үүрэг болон биелэлтийг PDF хэлбэрээр авч, дамжуулж, архивлана.",
    emphasis: "file intake",
  },
  {
    title: "Хувийн цагийн хуваарь",
    description: "Хэрэглэгч бүр өөрийн хуваарь, хурлын цаг, даалгаврын хугацааг тусдаа харна.",
    emphasis: "schedule",
  },
  {
    title: "Үнэлгээ ба торгуулийн систем",
    description: "Manager ямар баг ямар явцтай байгааг харж, хугацаа хэтэрсэн үед оноо бууруулах эсвэл торгууль тэмдэглэнэ.",
    emphasis: "evaluation",
  },
  {
    title: "Хэлтэс дамнасан мэдэгдэл",
    description: "Нэг хэлтэст даалгавар очиход бусад холбогдох хэлтсүүдэд давхар мэдэгдэл очно.",
    emphasis: "notification",
  },
  {
    title: "Хурлын төрөл ба оролцогч сонголт",
    description: "Manager хурал зарлахдаа төрлөө сонгож, нийтээр эсвэл сонгомол оролцогчтой хурлыг үүсгэнэ.",
    emphasis: "meeting types",
  },
  {
    title: "Хоцорсон биелэлтийн диаграм",
    description: "Хугацаа хэтэрсэн биелэлт manager дээр 'өгөөгүй' гэж хадгалагдаж, диаграм дээр тусдаа харагдана.",
    emphasis: "late tracking",
  },
];

export const meetingTypeOptions: MeetingTypeOption[] = [
  {
    id: "all_hands",
    label: "Нийт хурал",
    audienceMode: "all",
    description: "Бүх хэлтэс, бүх түвшний оролцогчидтой байгууллагын хэмжээний хурал.",
  },
  {
    id: "management_review",
    label: "Удирдлагын хурал",
    audienceMode: "selected",
    description: "Director, manager, department head түвшний сонгомол оролцогчтой хурал.",
  },
  {
    id: "department_sync",
    label: "Хэлтсийн хурал",
    audienceMode: "hybrid",
    description: "Нэг эсвэл хэд хэдэн хэлтсийн дотоод уялдаа, тайлангийн хурал.",
  },
  {
    id: "urgent_issue",
    label: "Яаралтай хурал",
    audienceMode: "selected",
    description: "Тусгай асуудал, хоцрогдол, эрсдэлийн үед хурдан бүрдүүлэх хурал.",
  },
];

export const audienceGroups = [
  "Бүх хэлтэс",
  "Санхүү",
  "Хүний нөөц",
  "Үйл ажиллагаа",
  "Борлуулалт",
  "Маркетинг",
  "Технологи",
];

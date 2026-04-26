"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EmployeeShell } from "../_components/employee-shell";

type FulfillmentStatus = "Ноорог" | "Хадгалсан" | "Илгээсэн";

type FulfillmentItem = {
  id: string;
  title: string;
  status: FulfillmentStatus;
  sentTo: string;
  sentDate: string;
  taskId?: string; // Link to task
};

type DraftState = {
  year: string;
  month: string;
  day: string;
  documentNumber: string;
  sectionTitle: string;
  rowNumber: string;
  task: string;
  responsibleUnit: string;
  result: string;
  progress: string;
};

type SavedVersion = {
  id: string;
  savedAt: string;
  savedBy: string;
  draft: DraftState;
};

const currentUser = "Ажилтан Сарнай";

const sentFulfillments: FulfillmentItem[] = [
  {
    id: "F-001",
    title: "Сарын хяналтын тайлан бэлтгэх",
    status: "Илгээсэн",
    sentTo: "Менежер Тэмүүжин",
    sentDate: "2026-04-25 17:40",
    taskId: "WA-101",
  },
  {
    id: "F-002",
    title: "Шалгалтын бүртгэлийн хүснэгт шинэчлэх",
    status: "Хадгалсан",
    sentTo: "Багийн ахлагч Номин",
    sentDate: "2026-04-26 11:10",
    taskId: "WA-102",
  },
  {
    id: "F-003",
    title: "Салбарын гомдлын мөрөөр хариу хүргүүлэх",
    status: "Ноорог",
    sentTo: "Иргэдтэй ажиллах нэгж",
    sentDate: "Илгээгээгүй",
    taskId: "WA-103",
  },
];

const createEmptyDraft = (): DraftState => ({
  year: "",
  month: "",
  day: "",
  documentNumber: "",
  sectionTitle: "Нэг. Захиргаа, удирдлагын чиглэлээр",
  rowNumber: "",
  task: "",
  responsibleUnit: "",
  result: "",
  progress: "",
});

const initialDrafts: Record<string, DraftState> = {
  "F-001": createEmptyDraft(),
  "F-002": createEmptyDraft(),
  "F-003": createEmptyDraft(),
};

function getStatusClasses(status: FulfillmentStatus) {
  if (status === "Илгээсэн") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Хадгалсан") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-amber-100 text-amber-700";
}

const progressOptions = [
  { value: "", label: "Сонгоно уу" },
  { value: "эхлээгүй", label: "Эхлээгүй" },
  { value: "хийдэж байгаа", label: "Хийдэж байгаа" },
  { value: "дууссан", label: "Дууссан" },
];

function FulfillmentDocumentPreview({
  draft,
  onChange,
  readOnly = false,
}: {
  draft: DraftState;
  onChange?: (field: keyof DraftState, value: string) => void;
  readOnly?: boolean;
}) {
  const editable = (field: keyof DraftState, value: string) => {
    if (!readOnly && onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-stone-300 bg-white shadow-sm">
      <div className="border-b border-stone-300 px-6 py-8 text-stone-900">
        <p className="text-center text-sm font-medium leading-7">
          НИЙСЛЭЛИЙН ХЯНАЛТ ШАЛГАЛТЫН ГАЗРЫН ДАРГЫН ӨГСӨН ҮҮРЭГ ДААЛГАВРЫН БИЕЛЭЛТ
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <input
              value={draft.year}
              readOnly={readOnly}
              onChange={(event) => editable("year", event.target.value)}
              placeholder="2026"
              className="w-16 border-none bg-transparent text-center outline-none"
            />
            <span>оны</span>
            <input
              value={draft.month}
              readOnly={readOnly}
              onChange={(event) => editable("month", event.target.value)}
              placeholder="03"
              className="w-12 border-none bg-transparent text-center outline-none"
            />
            <span>сарын</span>
            <input
              value={draft.day}
              readOnly={readOnly}
              onChange={(event) => editable("day", event.target.value)}
              placeholder="30"
              className="w-12 border-none bg-transparent text-center outline-none"
            />
            <span>өдөр</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Улаанбаатар хот</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-stone-900">
          <thead>
            <tr className="bg-white">
              <th className="border border-stone-300 px-3 py-3 text-center font-semibold">Д/д</th>
              <th className="border border-stone-300 px-4 py-3 text-center font-semibold">
                Өгөгдсөн үүрэг даалгавар
              </th>
              <th className="border border-stone-300 px-4 py-3 text-center font-semibold">
                Хариуцах нэгж
              </th>
              <th className="border border-stone-300 px-4 py-3 text-center font-semibold">
                Биелэлт
              </th>
              <th className="border border-stone-300 px-3 py-3 text-center font-semibold">Хувь</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={5}
                className="border border-stone-300 px-6 py-3 text-center text-sm font-semibold"
              >
                <input
                  value={draft.sectionTitle}
                  readOnly={readOnly}
                  onChange={(event) => editable("sectionTitle", event.target.value)}
                  className="w-full border-none bg-transparent text-center outline-none"
                />
              </td>
            </tr>
            <tr className="align-top">
              <td className="border border-stone-300 px-3 py-4 text-center">
                <input
                  value={draft.rowNumber}
                  readOnly={readOnly}
                  onChange={(event) => editable("rowNumber", event.target.value)}
                  className="w-full border-none bg-transparent text-center text-sm font-semibold outline-none"
                />
              </td>
              <td className="border border-stone-300 px-4 py-4">
                <textarea
                  value={draft.task}
                  readOnly={readOnly}
                  onChange={(event) => editable("task", event.target.value)}
                  className="min-h-56 w-full resize-none border-none bg-transparent text-sm leading-7 outline-none"
                />
              </td>
              <td className="border border-stone-300 px-4 py-4">
                <textarea
                  value={draft.responsibleUnit}
                  readOnly={readOnly}
                  onChange={(event) => editable("responsibleUnit", event.target.value)}
                  className="min-h-56 w-full resize-none border-none bg-transparent text-center text-sm leading-7 outline-none"
                />
              </td>
              <td className="border border-stone-300 px-4 py-4">
                <textarea
                  value={draft.result}
                  readOnly={readOnly}
                  onChange={(event) => editable("result", event.target.value)}
                  className="min-h-56 w-full resize-none border-none bg-transparent text-sm leading-7 outline-none"
                />
              </td>
              <td className="border border-stone-300 px-3 py-4">
                <select
                  value={draft.progress}
                  disabled={readOnly}
                  onChange={(event) => editable("progress", event.target.value)}
                  className="w-full border-none bg-transparent text-center text-sm font-semibold outline-none cursor-pointer disabled:opacity-75"
                >
                  {progressOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function EmployeeFulfillmentPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const taskTitle = searchParams.get("taskTitle");

  // Find fulfillment item by taskId, or use first item if none found
  const defaultFulfillmentId = sentFulfillments.find(
    (f) => f.taskId === taskId
  )?.id ?? sentFulfillments[0].id;

  const [selectedId, setSelectedId] = useState(defaultFulfillmentId);
  const [drafts, setDrafts] = useState(initialDrafts);
  const [message, setMessage] = useState("");
  const [savedVersions, setSavedVersions] = useState<Record<string, SavedVersion[]>>({
    "F-001": [],
    "F-002": [],
    "F-003": [],
  });
  const [showSaved, setShowSaved] = useState(false);
  const [selectedSavedVersionId, setSelectedSavedVersionId] = useState<string | null>(null);

  // Show notification when coming from tasks page
  useEffect(() => {
    if (taskId) {
      const matchingItem = sentFulfillments.find((f) => f.taskId === taskId);
      if (matchingItem) {
        setMessage(`📌 "${taskTitle}" даалгаврын биелэлтийг энд оруулна уу.`);
        setTimeout(() => setMessage(""), 4000);
      }
    }
  }, [taskId, taskTitle]);

  const selectedItem =
    sentFulfillments.find((item) => item.id === selectedId) ?? sentFulfillments[0];

  const selectedSavedVersions = useMemo(
    () => savedVersions[selectedId] ?? [],
    [savedVersions, selectedId]
  );

  const currentDraft = useMemo(() => {
    const draft = drafts[selectedId];

    const hasAnyTypedValue = Boolean(
      draft.year ||
        draft.month ||
        draft.day ||
        draft.documentNumber ||
        draft.rowNumber ||
        draft.task ||
        draft.responsibleUnit ||
        draft.result ||
        draft.progress
    );

    if (hasAnyTypedValue || !selectedSavedVersions.length) {
      return draft;
    }

    return selectedSavedVersions[0].draft;
  }, [drafts, selectedId, selectedSavedVersions]);

  const selectedSavedVersion =
    selectedSavedVersions.find((version) => version.id === selectedSavedVersionId) ?? null;

  const handleChange = (field: keyof DraftState, value: string) => {
    setDrafts((current) => ({
      ...current,
      [selectedId]: {
        ...current[selectedId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const snapshot = JSON.parse(JSON.stringify(drafts[selectedId])) as DraftState;
    const now = new Date().toLocaleString("sv-SE").replace("T", " ");
    const versionId = `${selectedId}-${Date.now()}`;

    setSavedVersions((current) => ({
      ...current,
      [selectedId]: [
        { id: versionId, savedAt: now, savedBy: currentUser, draft: snapshot },
        ...(current[selectedId] ?? []),
      ],
    }));
    setSelectedSavedVersionId(versionId);
    setMessage(`${selectedId} биелэлтийн ноорог хадгалагдлаа.`);
    setShowSaved(false);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleSendCurrent = () => {
    setMessage(`${selectedId} дээр хийсэн засварыг амжилттай илгээлээ.`);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleSendSaved = () => {
    if (!selectedSavedVersion) {
      setMessage("Илгээх хадгалсан мэдээллээ эхлээд сонгоно уу.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    setMessage(
      `${selectedId} - ${selectedSavedVersion.savedBy} ${selectedSavedVersion.savedAt} үед хадгалсан хувилбарыг илгээлээ.`
    );
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <EmployeeShell
      currentPath="/employee/fulfillment"
      kicker="Fulfillment"
      title="Биелэлт илгээх, шинэчлэх хэсэг"
      description="Анхны маягт хоосон нээгдэнэ. Хадгалсны дараа хамгийн сүүлийн хувилбар харагдаж, хадгалсан түүхээс хэн хэзээ хадгалсныг сонгон илгээх боломжтой."
      stats={[
        { label: "Нийт бичиг", value: "8" },
        { label: "Илгээсэн", value: "4" },
        { label: "Ноорог", value: "2" },
        { label: "Хадгалсан", value: "2" },
      ]}
      notifications={3}
      noteText="Хүснэгтийн мэдээллээ хоосноос эхэлж бөглөөд хадгал. Дараа нь хадгалсан хувилбаруудаас зөвийг нь сонгож илгээнэ."
    >
      {message ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tabs</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">3 биелэлтийн tab</h2>

          <div className="mt-6 space-y-4">
            {sentFulfillments.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setShowSaved(false);
                  setSelectedSavedVersionId(savedVersions[item.id]?.[0]?.id ?? null);
                }}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  selectedId === item.id
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-950 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p
                      className={`text-xs uppercase tracking-[0.24em] ${
                        selectedId === item.id ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {item.id}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedId === item.id ? "bg-white/15 text-white" : getStatusClasses(item.status)
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div
                  className={`mt-4 grid gap-2 text-sm ${
                    selectedId === item.id ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  <p>Хүлээн авагч: {item.sentTo}</p>
                  <p>Сүүлийн төлөв: {item.sentDate}</p>
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Дэлгэрэнгүй tab</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedItem.title}</h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                selectedItem.status
              )}`}
            >
              {selectedItem.status}
            </span>
          </div>

          <div className="mt-6">
            {showSaved ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">Хадгалсан мэдээлэл</h3>
                  <p className="text-sm text-slate-500">
                    Хувилбар сонгоод илгээх боломжтой
                  </p>
                </div>

                {selectedSavedVersions.length ? (
                  <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                    <div className="space-y-3">
                      {selectedSavedVersions.map((version) => (
                        <button
                          key={version.id}
                          type="button"
                          onClick={() => setSelectedSavedVersionId(version.id)}
                          className={`w-full rounded-[22px] border p-4 text-left transition ${
                            selectedSavedVersionId === version.id
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-slate-200 bg-white text-slate-950 hover:border-slate-300"
                          }`}
                        >
                          <p className="text-sm font-semibold">{version.savedBy}</p>
                          <p
                            className={`mt-2 text-sm ${
                              selectedSavedVersionId === version.id
                                ? "text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            Хадгалсан: {version.savedAt}
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {selectedSavedVersion ? (
                        <>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <p>Хадгалсан: {selectedSavedVersion.savedAt}</p>
                            <p>Хадгалсан хэрэглэгч: {selectedSavedVersion.savedBy}</p>
                          </div>
                          <FulfillmentDocumentPreview draft={selectedSavedVersion.draft} readOnly />
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    Хадгалсан мэдээлэл одоогоор байхгүй байна.
                  </div>
                )}
              </div>
            ) : (
              <FulfillmentDocumentPreview draft={currentDraft} onChange={handleChange} />
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {showSaved ? (
              <>
                <button
                  type="button"
                  onClick={handleSendSaved}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Илгээх
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaved(false)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                  Буцах
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                  Хадгалах
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaved(true);
                    setSelectedSavedVersionId(selectedSavedVersions[0]?.id ?? null);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                  Хадгалсан мэдээлэл харах
                </button>
                <button
                  type="button"
                  onClick={handleSendCurrent}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Илгээх
                </button>
              </>
            )}
          </div>
        </article>
      </section>
    </EmployeeShell>
  );
}

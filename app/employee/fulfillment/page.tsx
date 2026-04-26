"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EmployeeShell } from "../_components/employee-shell";

type FulfillmentStatus = "Ноорог" | "Хадгалсан" | "Илгээсэн";

type Comment = {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
  replies?: Comment[];
  parentId?: string;
};

type FulfillmentItem = {
  id: string;
  title: string;
  status: FulfillmentStatus;
  sentTo: string;
  sentDate: string;
  taskId?: string; // Link to task
  comments: Comment[];
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
    comments: [],
  },
  {
    id: "F-002",
    title: "Шалгалтын бүртгэлийн хүснэгт шинэчлэх",
    status: "Хадгалсан",
    sentTo: "Багийн ахлагч Номин",
    sentDate: "2026-04-26 11:10",
    taskId: "WA-102",
    comments: [],
  },
  {
    id: "F-003",
    title: "Салбарын гомдлын мөрөөр хариу хүргүүлэх",
    status: "Ноорог",
    sentTo: "Иргэдтэй ажиллах нэгж",
    sentDate: "Илгээгээгүй",
    taskId: "WA-103",
    comments: [],
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
  
  // Comment states
  const [fulfillments, setFulfillments] = useState<FulfillmentItem[]>(sentFulfillments);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

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

  // Fetch comments when selected item changes
  useEffect(() => {
    if (!selectedId) return;
    
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const response = await fetch(`/api/comments?fulfillment_id=${selectedId}`);
        if (response.ok) {
          const data = await response.json();
          const transformedComments = data.comments.map((c: any) => ({
            id: String(c.id),
            author: c.author,
            role: c.role,
            text: c.text,
            date: new Date(c.created_at).toLocaleString("mn-MN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            replies: (c.replies || []).map((r: any) => ({
              id: String(r.id),
              author: r.author,
              role: r.role,
              text: r.text,
              date: new Date(r.created_at).toLocaleString("mn-MN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              parentId: String(c.id),
            })),
          }));
          
          setFulfillments((current) =>
            current.map((item) =>
              item.id === selectedId ? { ...item, comments: transformedComments } : item
            )
          );
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [selectedId]);

  const selectedItem = fulfillments.find((item) => item.id === selectedId) ?? fulfillments[0];

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

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setMessage("Сэтгэгдэл хоосон байна.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    if (!selectedId) {
      setMessage("Биелэлт сонгогдоогүй байна.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillment_id: selectedId,
          author: currentUser,
          role: "Ажилтан",
          text: newComment.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newCommentObj: Comment = {
          id: String(data.comment.id),
          author: data.comment.author,
          role: data.comment.role,
          text: data.comment.text,
          date: new Date(data.comment.created_at).toLocaleString("mn-MN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          replies: [],
        };
        
        setFulfillments((current) =>
          current.map((item) =>
            item.id === selectedId
              ? { ...item, comments: [...item.comments, newCommentObj] }
              : item
          )
        );
        setNewComment("");
        setShowSaved(true);
        setMessage("Сэтгэгдэл нэмэгдлээ.");
        
        // Scroll to comments section
        setTimeout(() => {
          commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
      setMessage("Сэтгэгдэл нэмэхэд алдаа гарлаа.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim()) {
      setMessage("Хариулт хоосон байна.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillment_id: selectedId,
          author: currentUser,
          role: "Ажилтан",
          text: replyText.trim(),
          parent_id: parseInt(parentId),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newReply: Comment = {
          id: String(data.comment.id),
          author: data.comment.author,
          role: data.comment.role,
          text: data.comment.text,
          date: new Date(data.comment.created_at).toLocaleString("mn-MN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          parentId: parentId,
        };

        setFulfillments((current) =>
          current.map((item) =>
            item.id === selectedId
              ? {
                  ...item,
                  comments: item.comments.map((c) =>
                    c.id === parentId
                      ? { ...c, replies: [...(c.replies || []), newReply] }
                      : c
                  ),
                }
              : item
          )
        );
        setReplyTo(null);
        setReplyText("");
        setShowSaved(true);
        setMessage("Хариулт нэмэгдлээ.");
        
        // Scroll to comments section
        setTimeout(() => {
          commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to add reply:", err);
      setMessage("Хариулт нэмэхэд алдаа гарлаа.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (isReply && parentId) {
          setFulfillments((current) =>
            current.map((item) =>
              item.id === selectedId
                ? {
                    ...item,
                    comments: item.comments.map((c) =>
                      c.id === parentId
                        ? { ...c, replies: c.replies?.filter((r) => r.id !== commentId) || [] }
                        : c
                    ),
                  }
                : item
            )
          );
        } else {
          setFulfillments((current) =>
            current.map((item) =>
              item.id === selectedId
                ? { ...item, comments: item.comments.filter((c) => c.id !== commentId) }
                : item
            )
          );
        }
        setMessage("Сэтгэгдэл устгагдлаа.");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setMessage("Сэтгэгдэл устгахад алдаа гарлаа.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleEditComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!editText.trim()) {
      setMessage("Сэтгэгдэл хоосон байна.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(commentId),
          text: editText.trim(),
        }),
      });

      if (response.ok) {
        if (isReply && parentId) {
          setFulfillments((current) =>
            current.map((item) =>
              item.id === selectedId
                ? {
                    ...item,
                    comments: item.comments.map((c) =>
                      c.id === parentId
                        ? {
                            ...c,
                            replies: c.replies?.map((r) =>
                              r.id === commentId ? { ...r, text: editText.trim() } : r
                            ),
                          }
                        : c
                    ),
                  }
                : item
            )
          );
        } else {
          setFulfillments((current) =>
            current.map((item) =>
              item.id === selectedId
                ? {
                    ...item,
                    comments: item.comments.map((c) =>
                      c.id === commentId ? { ...c, text: editText.trim() } : c
                    ),
                  }
                : item
            )
          );
        }
        setEditingComment(null);
        setEditText("");
        setMessage("Сэтгэгдэл шинэчлэгдлээ.");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to edit comment:", err);
      setMessage("Сэтгэгдэл засахад алдаа гарлаа.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const startEdit = (commentId: string, currentText: string) => {
    setEditingComment(commentId);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText("");
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
            {fulfillments.map((item) => (
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
                  {item.comments.length > 0 && (
                    <p>Сэтгэгдэл: {item.comments.length}</p>
                  )}
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
                  onClick={() => {
                    setShowComments(!showComments);
                    setTimeout(() => {
                      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                  {showComments ? "Сэтгэгдэл хаах" : "Сэтгэгдэл нэмэх"}
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

          <div className="mt-8 border-t border-slate-200 pt-6" ref={commentsRef}>
            {showComments && (
              <>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Сэтгэгдэл</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              {selectedItem.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)} сэтгэгдэл
            </h3>

            <div className="mt-4 space-y-4">
              {isLoadingComments && (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                  <span className="animate-spin">⏳</span>
                  Сэтгэгдэл ачаалж байна...
                </div>
              )}
              
              {!isLoadingComments && selectedItem.comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="relative rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-950">{comment.author}</span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">{comment.role}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{comment.date}</span>
                      </div>
                      {editingComment !== comment.id && comment.author === currentUser && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(comment.id, comment.text)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                            title="Засах"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition"
                            title="Устгах"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {editingComment === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditComment(comment.id)}
                            className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            Хадгалах
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-slate-50"
                          >
                            Цуцлах
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-700">{comment.text}</p>
                    )}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(comment.id);
                          setReplyText("");
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 transition"
                      >
                        Хариулах
                      </button>
                    </div>
                  </div>

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 space-y-3 border-l-2 border-slate-200 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="relative rounded-2xl bg-slate-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-slate-950">{reply.author}</span>
                              <span className="rounded-full bg-slate-300 px-2 py-0.5 text-xs text-slate-700">{reply.role}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">{reply.date}</span>
                            </div>
                            {editingComment !== reply.id && reply.author === currentUser && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(reply.id, reply.text)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                                  title="Засах"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition"
                                  title="Устгах"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          {editingComment === reply.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="min-h-16 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditComment(reply.id, true, comment.id)}
                                  className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                                >
                                  Хадгалах
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-slate-50"
                                >
                                  Цуцлах
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-slate-700">{reply.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {replyTo === comment.id && (
                    <div className="ml-8 space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Хариулт бичих..."
                        className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold text-white transition ${
                            replyText.trim()
                              ? "bg-slate-950 hover:bg-slate-800"
                              : "bg-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Хариулах
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyText("");
                          }}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-50"
                        >
                          Цуцлах
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {!isLoadingComments && selectedItem.comments.length === 0 && (
                <p className="text-sm text-slate-400">Сэтгэгдэл байхгүй.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-3">Шинэ сэтгэгдэл</p>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Сэтгэгдэл бичих..."
                className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddComment}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${
                    newComment.trim() 
                      ? "bg-slate-950 hover:bg-slate-800" 
                      : "bg-slate-400 cursor-not-allowed"
                  }`}
                >
                  Сэтгэгдэл нэмэх
                </button>
              </div>
            </div>
              </>
            )}
          </div>
        </article>
      </section>
    </EmployeeShell>
  );
}

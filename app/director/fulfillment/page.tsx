"use client";

import { useEffect, useMemo, useState } from "react";
import { DirectorShell } from "../_components/director-shell";
import { getUnreadNotificationCount, createNotification } from "@/app/_lib/notifications";

type FulfillmentStatus = "Ноорог" | "Хадгалсан" | "Илгээсэн";
type Role = "Менежер" | "Ажилтан";

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
  fromRole: Role;
  fromName: string;
  sentTo: string;
  sentDate: string;
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

const currentUser = "Директор Энх";

const sentFulfillments: FulfillmentItem[] = [
  {
    id: "F-001",
    title: "Төсвийн гүйцэтгэлийн тайлан",
    status: "Илгээсэн",
    fromRole: "Менежер",
    fromName: "Тэмүүжин",
    sentTo: "Директор Энх",
    sentDate: "2026-04-25 17:40",
    comments: [],
  },
  {
    id: "F-002",
    title: "Стратегийн төлөвлөгөөний биелэлт",
    status: "Илгээсэн",
    fromRole: "Ажилтан",
    fromName: "Бат",
    sentTo: "Директор Энх",
    sentDate: "2026-04-26 09:15",
    comments: [],
  },
  {
    id: "F-003",
    title: "Сарын ажлын тайлан",
    status: "Хадгалсан",
    fromRole: "Ажилтан",
    fromName: "Сарнай",
    sentTo: "Менежер Тэмүүжин",
    sentDate: "2026-04-26 14:20",
    comments: [],
  },
  {
    id: "F-004",
    title: "Түншлэлийн гэрээний төсөл",
    status: "Ноорог",
    fromRole: "Менежер",
    fromName: "Тэмүүжин",
    sentTo: "Хуулийн алба",
    sentDate: "Илгээгээгүй",
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
  "F-001": {
    year: "2026",
    month: "04",
    day: "25",
    documentNumber: "TB-2026-0425",
    sectionTitle: "Нэг. Төсвийн гүйцэтгэл",
    rowNumber: "1",
    task: "Төсвийн гүйцэтгэлийг хянах, дүгнэх",
    responsibleUnit: "Санхүүгийн алба",
    result: "Гүйцэтгэл 91% байна. Зардал хяналтад байна.",
    progress: "дууссан",
  },
  "F-002": {
    year: "2026",
    month: "04",
    day: "26",
    documentNumber: "ST-2026-0426",
    sectionTitle: "Нэг. Стратегийн зорилт",
    rowNumber: "1",
    task: "Стратегийн төлөвлөгөөний биелэлтийг хянан мэдээдэх",
    responsibleUnit: "Стратегийн хэлтэс",
    result: "Зорилт 79% биелэгдэж байна. Үлдэгдэл ажилууд төлөвлөгөөний дагуу.",
    progress: "хийдэж байгаа",
  },
  "F-003": {
    year: "2026",
    month: "04",
    day: "26",
    documentNumber: "SA-2026-0426",
    sectionTitle: "Нэг. Сарын ажлын тайлан",
    rowNumber: "1",
    task: "Сарын гүйцэтгэлийн тайлан гаргах",
    responsibleUnit: "Үйл ажиллагааны хэлтэс",
    result: "Тайлан бүрэн гарсан.",
    progress: "дууссан",
  },
  "F-004": createEmptyDraft(),
};

function getStatusClasses(status: FulfillmentStatus) {
  if (status === "Илгээсэн") return "bg-emerald-100 text-emerald-700";
  if (status === "Хадгалсан") return "bg-sky-100 text-sky-700";
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
              onChange={(e) => editable("year", e.target.value)}
              placeholder="2026"
              className="w-16 border-none bg-transparent text-center outline-none"
            />
            <span>оны</span>
            <input
              value={draft.month}
              readOnly={readOnly}
              onChange={(e) => editable("month", e.target.value)}
              placeholder="03"
              className="w-12 border-none bg-transparent text-center outline-none"
            />
            <span>сарын</span>
            <input
              value={draft.day}
              readOnly={readOnly}
              onChange={(e) => editable("day", e.target.value)}
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
              <th className="border border-stone-300 px-4 py-3 text-center font-semibold">Өгөгдсөн үүрэг даалгавар</th>
              <th className="border border-stone-300 px-4 py-3 text-center font-semibold">Хариуцах нэгж</th>
              <th className="border border-stone-300 px-4 py-3 text-center font-semibold">Биелэлт</th>
              <th className="border border-stone-300 px-3 py-3 text-center font-semibold">Хувь</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="border border-stone-300 px-6 py-3 text-center text-sm font-semibold">
                <input
                  value={draft.sectionTitle}
                  readOnly={readOnly}
                  onChange={(e) => editable("sectionTitle", e.target.value)}
                  className="w-full border-none bg-transparent text-center outline-none"
                />
              </td>
            </tr>
            <tr className="align-top">
              <td className="border border-stone-300 px-3 py-4 text-center">
                <input
                  value={draft.rowNumber}
                  readOnly={readOnly}
                  onChange={(e) => editable("rowNumber", e.target.value)}
                  className="w-full border-none bg-transparent text-center text-sm font-semibold outline-none"
                />
              </td>
              <td className="border border-stone-300 px-4 py-4">
                <textarea
                  value={draft.task}
                  readOnly={readOnly}
                  onChange={(e) => editable("task", e.target.value)}
                  className="min-h-56 w-full resize-none border-none bg-transparent text-sm leading-7 outline-none"
                />
              </td>
              <td className="border border-stone-300 px-4 py-4">
                <textarea
                  value={draft.responsibleUnit}
                  readOnly={readOnly}
                  onChange={(e) => editable("responsibleUnit", e.target.value)}
                  className="min-h-56 w-full resize-none border-none bg-transparent text-center text-sm leading-7 outline-none"
                />
              </td>
              <td className="border border-stone-300 px-4 py-4">
                <textarea
                  value={draft.result}
                  readOnly={readOnly}
                  onChange={(e) => editable("result", e.target.value)}
                  className="min-h-56 w-full resize-none border-none bg-transparent text-sm leading-7 outline-none"
                />
              </td>
              <td className="border border-stone-300 px-3 py-4">
                <select
                  value={draft.progress}
                  disabled={readOnly}
                  onChange={(e) => editable("progress", e.target.value)}
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

export default function DirectorFulfillmentPage() {
  const [fulfillments, setFulfillments] = useState<FulfillmentItem[]>(sentFulfillments);
  const [selectedFulfillment, setSelectedFulfillment] = useState<FulfillmentItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftState>(createEmptyDraft());
  const [message, setMessage] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = 1; // TODO: Get from auth context
  const [roleFilter, setRoleFilter] = useState<Role | "Бүгд">("Бүгд");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>(initialDrafts);

  // Fetch notification count
  useEffect(() => {
    getUnreadNotificationCount(userId).then(setNotificationCount);
  }, [userId]);

  const filteredFulfillments = useMemo(() => {
    if (roleFilter === "Бүгд") return fulfillments;
    return fulfillments.filter((item) => item.fromRole === roleFilter);
  }, [fulfillments, roleFilter]);

  const selectedItem = filteredFulfillments.find((item) => item.id === selectedId) ?? filteredFulfillments[0] ?? fulfillments[0];

  const handleDraftChange = (field: keyof DraftState, value: string) => {
    if (!selectedId) return;
    setDrafts((current) => ({
      ...current,
      [selectedId]: {
        ...current[selectedId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setMessage(`${selectedId} биелэлтийн ноорог хадгалагдлаа.`);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleSendCurrent = () => {
    setMessage(`${selectedId} дээр хийсэн засварыг амжилттай баталгаажууллаа.`);
    setTimeout(() => setMessage(""), 2500);
  };

  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Fetch comments from database when selected fulfillment changes
  useEffect(() => {
    if (!selectedId) return;
    
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const response = await fetch(`/api/comments?fulfillment_id=${selectedId}`);
        if (response.ok) {
          const data = await response.json();
          // Transform database format to frontend format
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
          role: "Директор",
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
        
        // Send notification to the fulfillment owner (manager)
        const selectedItem = fulfillments.find((item) => item.id === selectedId);
        if (selectedItem && selectedItem.fromRole === "Менежер") {
          // Find manager ID from name (simplified - in real app, you'd have proper user mapping)
          const managerId = 2; // TODO: Get actual manager ID from user mapping
          await createNotification(
            managerId,
            'Шинэ сэтгэгдэл',
            `Директор таны биелэлт дээр сэтгэгдэл үлдээлээ: ${selectedItem.title}`,
            'comment',
            '/director/fulfillment'
          );
        }
        
        setNewComment("");
        setMessage("Сэтгэгдэл нэмэгдлээ.");
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
          role: "Директор",
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
                  comments: item.comments.map((comment) =>
                    comment.id === parentId
                      ? { ...comment, replies: [...(comment.replies || []), newReply] }
                      : comment
                  ),
                }
              : item
          )
        );
        setReplyText("");
        setReplyTo(null);
        setMessage("Хариулт нэмэгдлээ.");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to add reply:", err);
      setMessage("Хариулт нэмэхэд алдаа гарлаа.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    console.log('Delete clicked:', commentId, 'selectedId:', selectedId);
    if (!selectedId) {
      console.log('No selectedId, returning');
      return;
    }

    try {
      console.log('Making DELETE request for id:', commentId);
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });
      console.log('Delete response:', response.status, response.ok);

      if (response.ok) {
        setFulfillments((current) =>
          current.map((item) =>
            item.id === selectedId
              ? {
                  ...item,
                  comments: isReply && parentId
                    ? item.comments.map((comment) =>
                        comment.id === parentId
                          ? { ...comment, replies: (comment.replies || []).filter((r) => r.id !== commentId) }
                          : comment
                      )
                    : item.comments.filter((c) => c.id !== commentId),
                }
              : item
          )
        );
        setMessage(isReply ? "Хариулт устгагдлаа." : "Сэтгэгдэл устгагдлаа.");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setMessage("Устгахад алдаа гарлаа.");
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
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setFulfillments((current) =>
          current.map((item) =>
            item.id === selectedId
              ? {
                  ...item,
                  comments: isReply && parentId
                    ? item.comments.map((comment) =>
                        comment.id === parentId
                          ? {
                              ...comment,
                              replies: (comment.replies || []).map((r) =>
                                r.id === commentId
                                  ? { ...r, text: data.comment.text }
                                  : r
                              ),
                            }
                          : comment
                      )
                    : item.comments.map((c) =>
                        c.id === commentId ? { ...c, text: data.comment.text } : c
                      ),
                }
              : item
          )
        );
        setEditingComment(null);
        setEditText("");
        setMessage("Сэтгэгдэл шинэчлэгдлээ.");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to edit comment:", err);
      setMessage("Засахад алдаа гарлаа.");
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
    <DirectorShell
      currentPath="/director/fulfillment"
      kicker="Fulfillment"
      title="Биелэлт илгээх, шинэчлэх хэсэг"
      description="Анхны маягт хоосон нээгдэнэ. Хадгалсны дараа хамгийн сүүлийн хувилбар харагдаж, баталгаажуулалт хийх боломжтой."
      stats={[
        { label: "Нийт бичиг", value: String(fulfillments.length) },
        { label: "Илгээсэн", value: String(fulfillments.filter((i) => i.status === "Илгээсэн").length) },
        { label: "Менежер", value: String(fulfillments.filter((i) => i.fromRole === "Менежер").length) },
        { label: "Ажилтан", value: String(fulfillments.filter((i) => i.fromRole === "Ажилтан").length) },
      ]}
      notifications={notificationCount}
      userId={userId}
      noteText="Менежер болон ажилтнуудын биелэлтийг хянаж, засвартай баталгаажуулна. Сэтгэгдэл бичих боломжтой."
    >
      {message ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Жагсаалт</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{filteredFulfillments.length} биелэлт</h2>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as Role | "Бүгд");
                setSelectedId("");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="Бүгд">Бүгд</option>
              <option value="Менежер">Менежер</option>
              <option value="Ажилтан">Ажилтан</option>
            </select>
          </div>

          <div className="mt-6 space-y-4">
            {filteredFulfillments.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setShowSaved(false);
                }}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  selectedId === item.id
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-950 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] ${selectedId === item.id ? "text-slate-300" : "text-slate-400"}`}>
                      {item.id}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedId === item.id ? "bg-white/15 text-white" : getStatusClasses(item.status)
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className={`mt-4 grid gap-2 text-sm ${selectedId === item.id ? "text-slate-200" : "text-slate-600"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      item.fromRole === "Менежер" 
                        ? "bg-indigo-100 text-indigo-700" 
                        : "bg-teal-100 text-teal-700"
                    }`}>
                      {item.fromRole}
                    </span>
                    <span>{item.fromName}</span>
                  </div>
                  <p>Хүлээн авагч: {item.sentTo}</p>
                  <p>Илгээсэн: {item.sentDate}</p>
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Дэлгэрэнгүй</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedItem.title}</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(selectedItem.status)}`}>
              {selectedItem.status}
            </span>
          </div>

          <div className="mt-6">
            <FulfillmentDocumentPreview draft={currentDraft} onChange={handleChange} readOnly={false} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              Хадгалах
            </button>
            <button
              type="button"
              onClick={handleSendCurrent}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Баталгаажуулах
            </button>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
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
                      {editingComment !== comment.id && (
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
                            {editingComment !== reply.id && (
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
          </div>
        </article>
      </section>
    </DirectorShell>
  );
}

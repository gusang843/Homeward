"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Schedule = {
  _id: string;
  userId: string;
  title: string;
  date: string;
  type: string;
  memo?: string;
  createdAt?: string;
};

const TYPE_OPTIONS = [
  "지원 마감",
  "서류 발표",
  "면접",
  "시험",
  "취업 준비",
  "기타",
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("기타");
  const [memo, setMemo] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("전체");

  const [saving, setSaving] = useState(false);

  const loadSchedules = async () => {
    try {
      const savedUser = localStorage.getItem("homewardUser");

      if (!savedUser) {
        window.location.href = "/login";
        return;
      }

      const user = JSON.parse(savedUser);

      const response = await fetch(
        `/api/schedules?userId=${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setSchedules(data.schedules || []);
      } else {
        alert(data.message || "일정을 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("일정 조회 오류:", error);
      alert("일정을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setType("기타");
    setMemo("");
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("일정 제목을 입력해주세요.");
      return;
    }

    if (!date) {
      alert("일정 날짜를 선택해주세요.");
      return;
    }

    try {
      setSaving(true);

      const savedUser = localStorage.getItem("homewardUser");

      if (!savedUser) {
        alert("로그인이 필요합니다.");
        window.location.href = "/login";
        return;
      }

      const user = JSON.parse(savedUser);

      const method = editingId ? "PUT" : "POST";

      const body = {
        ...(editingId ? { id: editingId } : {}),
        userId: user.id,
        title: title.trim(),
        date,
        type,
        memo: memo.trim(),
      };

      const response = await fetch("/api/schedules", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "일정 저장에 실패했습니다.");
        return;
      }

      alert(
        editingId
          ? "일정이 수정되었습니다."
          : "일정이 등록되었습니다."
      );

      resetForm();
      await loadSchedules();
    } catch (error) {
      console.error("일정 저장 오류:", error);
      alert("일정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule._id);
    setTitle(schedule.title);
    setDate(formatDateForInput(schedule.date));
    setType(schedule.type || "기타");
    setMemo(schedule.memo || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "정말 이 일정을 삭제하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const savedUser = localStorage.getItem("homewardUser");

      if (!savedUser) {
        alert("로그인이 필요합니다.");
        window.location.href = "/login";
        return;
      }

      const user = JSON.parse(savedUser);

      const response = await fetch("/api/schedules", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "일정 삭제에 실패했습니다.");
        return;
      }

      if (editingId === id) {
        resetForm();
      }

      await loadSchedules();
    } catch (error) {
      console.error("일정 삭제 오류:", error);
      alert("일정 삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesSearch =
        schedule.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        schedule.memo
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        filterType === "전체" ||
        schedule.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [schedules, search, filterType]);

  const upcomingSchedules = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return schedules.filter((schedule) => {
      const target = new Date(schedule.date);

      target.setHours(0, 0, 0, 0);

      return target >= today;
    }).length;
  }, [schedules]);

  const getDDay = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const difference = Math.ceil(
      (target.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (difference === 0) {
      return "D-Day";
    }

    if (difference > 0) {
      return `D-${difference}`;
    }

    return `D+${Math.abs(difference)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      "ko-KR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getTypeClass = (scheduleType: string) => {
    switch (scheduleType) {
      case "지원 마감":
        return "bg-red-100 text-red-700";

      case "서류 발표":
        return "bg-blue-100 text-blue-700";

      case "면접":
        return "bg-purple-100 text-purple-700";

      case "시험":
        return "bg-yellow-100 text-yellow-700";

      case "취업 준비":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("homewardUser");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">
          일정을 불러오는 중...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="text-2xl font-bold"
          >
            🏠 Homeward
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-black"
            >
              대시보드
            </Link>

            <Link
              href="/companies"
              className="text-gray-600 hover:text-black"
            >
              기업 관리
            </Link>

            <Link
              href="/schedules"
              className="font-semibold text-black"
            >
              일정 관리
            </Link>

            <Link
              href="/statistics"
              className="text-gray-600 hover:text-black"
            >
              통계
            </Link>

            <Link
              href="/mypage"
              className="text-gray-600 hover:text-black"
            >
              👤 마이페이지
            </Link>
          </nav>

          <button
            onClick={handleLogout}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 본문 */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            일정 관리
          </h1>

          <p className="mt-2 text-gray-500">
            면접, 지원 마감일, 취업 준비 일정을 관리하세요.
          </p>
        </div>

        {/* 일정 등록 / 수정 */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {editingId
                  ? "일정 수정"
                  : "새 일정 등록"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                중요한 일정을 등록해보세요.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                수정 취소
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* 제목 */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                일정 제목
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="예: 삼성전자 면접"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 날짜 */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                날짜
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 유형 */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                일정 유형
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* 메모 */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                메모
              </label>

              <textarea
                value={memo}
                onChange={(event) =>
                  setMemo(event.target.value)
                }
                placeholder="일정에 대한 메모를 입력해주세요."
                rows={4}
                className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 버튼 */}
            <div className="md:col-span-2 flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-5 py-3 text-sm hover:bg-gray-50"
                >
                  취소
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? "저장 중..."
                  : editingId
                  ? "일정 수정"
                  : "일정 등록"}
              </button>
            </div>
          </form>
        </section>

        {/* 통계 카드 */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              전체 일정
            </p>

            <p className="mt-3 text-3xl font-bold">
              {schedules.length}
              <span className="ml-1 text-base font-normal">
                개
              </span>
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              예정된 일정
            </p>

            <p className="mt-3 text-3xl font-bold">
              {upcomingSchedules}
              <span className="ml-1 text-base font-normal">
                개
              </span>
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-gray-500">
              오늘 일정
            </p>

            <p className="mt-3 text-3xl font-bold">
              {
                schedules.filter((schedule) => {
                  const today = new Date();
                  const target = new Date(schedule.date);

                  return (
                    today.getFullYear() ===
                      target.getFullYear() &&
                    today.getMonth() ===
                      target.getMonth() &&
                    today.getDate() ===
                      target.getDate()
                  );
                }).length
              }
              <span className="ml-1 text-base font-normal">
                개
              </span>
            </p>
          </div>
        </section>

        {/* 검색 / 필터 */}
        <section className="mt-8 rounded-2xl border bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="일정 제목 또는 메모 검색"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            <select
              value={filterType}
              onChange={(event) =>
                setFilterType(event.target.value)
              }
              className="rounded-lg border px-4 py-3 outline-none focus:border-black"
            >
              <option value="전체">
                전체 유형
              </option>

              {TYPE_OPTIONS.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* 일정 목록 */}
        <section className="mt-6 rounded-2xl border bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                일정 목록
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                등록된 일정을 확인하고 관리하세요.
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {filteredSchedules.length}개
            </span>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl">📅</p>

              <p className="mt-4 font-medium">
                등록된 일정이 없습니다.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                위에서 새로운 일정을 등록해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="rounded-xl border p-5 transition hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold">
                          {schedule.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getTypeClass(
                            schedule.type
                          )}`}
                        >
                          {schedule.type}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>
                          📅 {formatDate(schedule.date)}
                        </span>

                        <span>
                          ⏳ {getDDay(schedule.date)}
                        </span>
                      </div>

                      {schedule.memo && (
                        <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                          {schedule.memo}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(schedule)
                        }
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(schedule._id)
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
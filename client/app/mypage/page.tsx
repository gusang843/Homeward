"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  dischargeDate?: string;
};

function formatDate(date?: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getDDay(date?: string) {
  if (!date) return null;

  const target = new Date(date);
  const today = new Date();

  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (target.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";

  return `D+${Math.abs(diff)}`;
}

export default function MyPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("homewardUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const currentUser: User = JSON.parse(savedUser);

      setUser(currentUser);
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");

      if (currentUser.dischargeDate) {
        const date = new Date(currentUser.dischargeDate);

        const formattedDate = date
          .toISOString()
          .split("T")[0];

        setDischargeDate(formattedDate);
      }

      setLoading(false);
    } catch (error) {
      console.error("사용자 정보 오류:", error);

      localStorage.removeItem("homewardUser");
      router.push("/login");
    }
  }, [router]);

  const handleSave = async () => {
    if (!user) return;

    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name: name.trim(),
          dischargeDate: dischargeDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message || "정보 수정에 실패했습니다."
        );
        return;
      }

      const updatedUser: User = data.user;

      setUser(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);

      if (updatedUser.dischargeDate) {
        const date = new Date(updatedUser.dischargeDate);

        setDischargeDate(
          date.toISOString().split("T")[0]
        );
      } else {
        setDischargeDate("");
      }

      localStorage.setItem(
        "homewardUser",
        JSON.stringify(updatedUser)
      );

      alert("정보가 수정되었습니다.");
    } catch (error) {
      console.error("정보 수정 오류:", error);

      alert("정보 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("homewardUser");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-gray-900 transition hover:text-blue-600"
          >
            Homeward
          </Link>

          <nav className="hidden items-center gap-1 md:flex">

            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              대시보드
            </Link>

            <Link
              href="/companies"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              기업 관리
            </Link>

            <Link
              href="/schedules"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              일정 관리
            </Link>

            <Link
              href="/statistics"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              통계
            </Link>

            <Link
              href="/mypage"
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600"
            >
              마이페이지
            </Link>

            <button
              onClick={handleLogout}
              className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500"
            >
              로그아웃
            </button>

          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">

            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              홈
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500"
            >
              로그아웃
            </button>

          </div>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Title */}
        <section className="mb-8">

          <p className="mb-2 text-sm font-medium text-blue-600">
            My Page
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            마이페이지
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            계정 정보와 전역일을 관리할 수 있습니다.
          </p>

        </section>

        {/* Profile + D-Day */}
        <section className="grid gap-6 lg:grid-cols-3">

          {/* Profile Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-gray-900">
                계정 정보
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Homeward 계정 정보를 관리하세요.
              </p>

            </div>

            <div className="space-y-5">

              {/* Name */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  이름
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  이메일
                </label>

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                />

                <p className="mt-2 text-xs text-gray-400">
                  이메일은 변경할 수 없습니다.
                </p>

              </div>

              {/* Discharge Date */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  전역일
                </label>

                <input
                  type="date"
                  value={dischargeDate}
                  onChange={(e) =>
                    setDischargeDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving ? "저장 중..." : "정보 저장"}
            </button>

          </div>

          {/* D-Day Card */}
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-sm">

            <div className="flex h-full flex-col justify-between">

              <div>

                <p className="text-sm font-medium text-blue-100">
                  전역까지
                </p>

                <p className="mt-3 text-5xl font-black tracking-tight">
                  {getDDay(
                    user?.dischargeDate ||
                      (dischargeDate
                        ? dischargeDate
                        : undefined)
                  ) || "-"}
                </p>

              </div>

              <div className="mt-10">

                <p className="text-xs text-blue-100">
                  전역 예정일
                </p>

                <p className="mt-1 text-lg font-bold">
                  {user?.dischargeDate
                    ? formatDate(user.dischargeDate)
                    : dischargeDate
                    ? formatDate(dischargeDate)
                    : "미등록"}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Account Summary */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-gray-900">
              계정 요약
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              현재 계정 정보를 확인하세요.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs font-medium text-gray-400">
                이름
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {user?.name || "-"}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs font-medium text-gray-400">
                이메일
              </p>

              <p className="mt-2 truncate font-semibold text-gray-900">
                {user?.email || "-"}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs font-medium text-gray-400">
                전역일
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {user?.dischargeDate
                  ? formatDate(user.dischargeDate)
                  : "미등록"}
              </p>

            </div>

          </div>

        </section>

        {/* Bottom Buttons */}
        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">

          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            ← 대시보드로 돌아가기
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            로그아웃
          </button>

        </section>

      </div>

    </main>
  );
}
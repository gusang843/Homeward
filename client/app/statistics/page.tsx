"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  dischargeDate?: string;
};

type Company = {
  _id: string;
  name: string;
  jobPostUrl?: string;
  deadline?: string;
  status: string;
  createdAt?: string;
};

const STATUS_OPTIONS = [
  "지원 전",
  "서류 제출",
  "서류 합격",
  "면접",
  "최종 합격",
  "불합격",
];

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

function getStatusStyle(status: string) {
  switch (status) {
    case "지원 전":
      return "bg-slate-100 text-slate-700";

    case "서류 제출":
      return "bg-blue-100 text-blue-700";

    case "서류 합격":
      return "bg-indigo-100 text-indigo-700";

    case "면접":
      return "bg-amber-100 text-amber-700";

    case "최종 합격":
      return "bg-emerald-100 text-emerald-700";

    case "불합격":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function StatisticsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("homewardUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const currentUser = JSON.parse(savedUser);

      setUser(currentUser);

      fetch(`/api/companies?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCompanies(data.companies || []);
          }
        })
        .catch((error) => {
          console.error(
            "통계 데이터 불러오기 오류:",
            error
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("사용자 정보 오류:", error);

      localStorage.removeItem("homewardUser");
      router.push("/login");
    }
  }, [router]);

  const totalCount = companies.length;

  const beforeCount = companies.filter(
    (company) => company.status === "지원 전"
  ).length;

  const documentSubmitCount = companies.filter(
    (company) => company.status === "서류 제출"
  ).length;

  const documentPassCount = companies.filter(
    (company) => company.status === "서류 합격"
  ).length;

  const interviewCount = companies.filter(
    (company) => company.status === "면접"
  ).length;

  const finalPassCount = companies.filter(
    (company) => company.status === "최종 합격"
  ).length;

  const failCount = companies.filter(
    (company) => company.status === "불합격"
  ).length;

  const activeCount = companies.filter(
    (company) =>
      company.status !== "최종 합격" &&
      company.status !== "불합격"
  ).length;

  const resultCount = finalPassCount + failCount;

  const passRate =
    resultCount > 0
      ? Math.round((finalPassCount / resultCount) * 100)
      : 0;

  const statusCounts: Record<string, number> = {
    "지원 전": beforeCount,
    "서류 제출": documentSubmitCount,
    "서류 합격": documentPassCount,
    "면접": interviewCount,
    "최종 합격": finalPassCount,
    "불합격": failCount,
  };

  const maxStatusCount = Math.max(
    ...Object.values(statusCounts),
    1
  );

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return [...companies]
      .filter((company) => {
        if (!company.deadline) return false;

        const deadline = new Date(company.deadline);

        deadline.setHours(0, 0, 0, 0);

        return deadline >= today;
      })
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() -
          new Date(b.deadline!).getTime()
      )
      .slice(0, 5);
  }, [companies]);

  const logout = () => {
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
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600"
            >
              통계
            </Link>

            <Link
              href="/mypage"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              마이페이지
            </Link>

            <button
              onClick={logout}
              className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500"
            >
              로그아웃
            </button>

          </nav>

          <div className="flex items-center gap-2 md:hidden">

            <Link
              href="/mypage"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              마이페이지
            </Link>

            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500"
            >
              로그아웃
            </button>

          </div>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Title */}
        <section className="mb-8">

          <p className="mb-2 text-sm font-medium text-blue-600">
            Statistics
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            지원 통계
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {user?.name}님의 취업 지원 현황을 한눈에 확인하세요.
          </p>

        </section>

        {/* Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* 전체 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-gray-500">
                전체 지원
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                🏢
              </div>

            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900">
              {totalCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              등록된 전체 기업
            </p>

          </div>

          {/* 진행 중 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-gray-500">
                진행 중
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                🔄
              </div>

            </div>

            <p className="mt-4 text-3xl font-bold text-amber-600">
              {activeCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              결과를 기다리는 지원
            </p>

          </div>

          {/* 합격 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-gray-500">
                최종 합격
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                ✅
              </div>

            </div>

            <p className="mt-4 text-3xl font-bold text-emerald-600">
              {finalPassCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              최종 합격 기업
            </p>

          </div>

          {/* 합격률 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-gray-500">
                합격률
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                📈
              </div>

            </div>

            <p className="mt-4 text-3xl font-bold text-indigo-600">
              {passRate}%
            </p>

            <p className="mt-2 text-xs text-gray-400">
              결과가 나온 지원 기준
            </p>

          </div>

        </section>

        {/* Status Chart + Result */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Status Chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-gray-900">
                지원 상태별 현황
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                현재 등록된 기업의 지원 상태입니다.
              </p>

            </div>

            <div className="space-y-5">

              {STATUS_OPTIONS.map((status) => {

                const count = statusCounts[status];

                const width =
                  totalCount > 0
                    ? `${(count / maxStatusCount) * 100}%`
                    : "0%";

                return (
                  <div key={status}>

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </div>

                      <span className="text-sm font-bold text-gray-900">
                        {count}
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{
                          width,
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* Result Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-gray-900">
                결과 현황
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                완료된 지원 결과를 확인하세요.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-emerald-50 p-5">

                <p className="text-sm font-medium text-emerald-700">
                  최종 합격
                </p>

                <p className="mt-3 text-3xl font-bold text-emerald-600">
                  {finalPassCount}
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  합격 기업
                </p>

              </div>

              <div className="rounded-2xl bg-red-50 p-5">

                <p className="text-sm font-medium text-red-700">
                  불합격
                </p>

                <p className="mt-3 text-3xl font-bold text-red-600">
                  {failCount}
                </p>

                <p className="mt-1 text-xs text-red-500">
                  불합격 기업
                </p>

              </div>

            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-5">

              <div className="flex items-center justify-between">

                <span className="text-sm font-medium text-gray-600">
                  결과가 나온 지원
                </span>

                <span className="font-bold text-gray-900">
                  {resultCount}건
                </span>

              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width:
                      resultCount > 0
                        ? `${(finalPassCount / resultCount) * 100}%`
                        : "0%",
                  }}
                />

              </div>

              <div className="mt-2 flex justify-between text-xs text-gray-400">

                <span>
                  합격 {finalPassCount}
                </span>

                <span>
                  불합격 {failCount}
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* Upcoming Deadlines */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>

              <h2 className="font-bold text-gray-900">
                다가오는 지원 마감
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                마감일이 가까운 기업입니다.
              </p>

            </div>

            <Link
              href="/companies"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              기업 관리
            </Link>

          </div>

          <div className="p-6">

            {upcomingDeadlines.length === 0 ? (

              <div className="py-10 text-center">

                <div className="text-3xl">
                  📅
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  예정된 지원 마감이 없습니다.
                </p>

              </div>

            ) : (

              <div className="grid gap-3 md:grid-cols-2">

                {upcomingDeadlines.map((company) => (

                  <div
                    key={company._id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-4 transition hover:bg-gray-100"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-gray-900">
                        {company.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        마감일 · {formatDate(company.deadline)}
                      </p>

                    </div>

                    <span className="ml-4 shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {getDDay(company.deadline)}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>

        {/* Company Table */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>

              <h2 className="font-bold text-gray-900">
                전체 지원 기업
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                현재 등록된 기업별 지원 상태입니다.
              </p>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              {totalCount}개
            </span>

          </div>

          <div className="overflow-x-auto">

            {companies.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <div className="text-3xl">
                  🏢
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  아직 등록된 지원 기업이 없습니다.
                </p>

                <Link
                  href="/companies"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  기업 등록하기
                </Link>

              </div>

            ) : (

              <table className="w-full min-w-[700px] text-sm">

                <thead>

                  <tr className="border-b border-gray-100 text-left text-xs text-gray-400">

                    <th className="px-6 py-4 font-medium">
                      기업명
                    </th>

                    <th className="px-6 py-4 font-medium">
                      지원 상태
                    </th>

                    <th className="px-6 py-4 font-medium">
                      마감일
                    </th>

                    <th className="px-6 py-4 font-medium">
                      D-Day
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {companies.map((company) => (

                    <tr
                      key={company._id}
                      className="border-b border-gray-50 last:border-0 transition hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-semibold text-gray-900">
                          {company.name}
                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            company.status
                          )}`}
                        >
                          {company.status}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(company.deadline)}
                      </td>

                      <td className="px-6 py-4">

                        {company.deadline ? (
                          <span className="font-semibold text-gray-700">
                            {getDDay(company.deadline)}
                          </span>
                        ) : (
                          <span className="text-gray-300">
                            -
                          </span>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}
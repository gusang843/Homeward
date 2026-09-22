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

type Schedule = {
  _id: string;
  title: string;
  date: string;
  type: string;
  memo?: string;
};

const STATUS_OPTIONS = [
  "지원 전",
  "서류 제출",
  "서류 합격",
  "면접",
  "최종 합격",
  "불합격",
];

function getDDay(date?: string) {
  if (!date) return null;

  const target = new Date(date);
  const today = new Date();

  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";
  return `D+${Math.abs(diff)}`;
}

function formatDate(date?: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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
      return "bg-slate-100 text-slate-700";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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

      Promise.all([
        fetch(`/api/companies?userId=${currentUser.id}`).then((res) =>
          res.json()
        ),
        fetch(`/api/schedules?userId=${currentUser.id}`).then((res) =>
          res.json()
        ),
      ])
        .then(([companyData, scheduleData]) => {
          if (companyData.success) {
            setCompanies(companyData.companies || []);
          }

          if (scheduleData.success) {
            setSchedules(scheduleData.schedules || []);
          }
        })
        .catch((error) => {
          console.error("대시보드 데이터 불러오기 오류:", error);
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

  const activeCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.status !== "최종 합격" &&
        company.status !== "불합격"
    );
  }, [companies]);

  const passedCompanies = useMemo(() => {
    return companies.filter(
      (company) => company.status === "최종 합격"
    );
  }, [companies]);

  const upcomingSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...schedules]
      .filter((schedule) => {
        const date = new Date(schedule.date);
        date.setHours(0, 0, 0, 0);

        return date >= today;
      })
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .slice(0, 5);
  }, [schedules]);

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

  const recentCompanies = useMemo(() => {
    return [...companies]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
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
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600"
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

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Welcome */}
        <section className="mb-8">

          <p className="mb-2 text-sm font-medium text-blue-600">
            Career & D-Day Management
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            안녕하세요, {user?.name}님 👋
          </h1>

        </section>

        {/* Discharge D-Day */}
        <section className="mb-8">

          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white shadow-lg">

            <div className="text-center">

              <p className="text-sm font-medium text-blue-100">
                전역까지
              </p>

              <p className="mt-2 text-6xl font-black tracking-tight sm:text-7xl">
                {getDDay(user?.dischargeDate) || "-"}
              </p>

              <p className="mt-4 text-lg font-medium text-blue-100">
                {user?.dischargeDate
                  ? formatDate(user.dischargeDate)
                  : "전역일을 등록해주세요"}
              </p>

            </div>

          </div>

        </section>

        {/* Main Stats */}
        <section className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              전체 지원 기업
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {companies.length}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              지금까지 등록한 기업
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              진행 중인 지원
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {activeCompanies.length}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              아직 결과가 나오지 않은 지원
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              최종 합격
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {passedCompanies.length}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              최종 합격한 기업
            </p>

          </div>

        </section>

        {/* Quick Menu */}
        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              빠른 메뉴
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <Link
              href="/companies"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                🏢
              </div>

              <h3 className="font-semibold text-gray-900">
                기업 관리
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                지원 기업을 등록하고 관리하세요.
              </p>
            </Link>

            <Link
              href="/schedules"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📅
              </div>

              <h3 className="font-semibold text-gray-900">
                일정 관리
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                면접과 시험 일정을 관리하세요.
              </p>
            </Link>

            <Link
              href="/statistics"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📊
              </div>

              <h3 className="font-semibold text-gray-900">
                지원 통계
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                지원 현황과 합격률을 확인하세요.
              </p>
            </Link>

          </div>

        </section>

        {/* Deadlines & Schedules */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Deadlines */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="font-bold text-gray-900">
                  다가오는 지원 마감
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  놓치지 말아야 할 지원 일정
                </p>
              </div>

              <Link
                href="/companies"
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                전체보기
              </Link>

            </div>

            <div className="p-6">

              {upcomingDeadlines.length === 0 ? (

                <div className="py-8 text-center text-sm text-gray-400">
                  예정된 지원 마감이 없습니다.
                </div>

              ) : (

                <div className="space-y-3">

                  {upcomingDeadlines.map((company) => (

                    <div
                      key={company._id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4 transition hover:bg-gray-100"
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

          </div>

          {/* Schedules */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="font-bold text-gray-900">
                  다가오는 일정
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  앞으로 예정된 일정
                </p>
              </div>

              <Link
                href="/schedules"
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                전체보기
              </Link>

            </div>

            <div className="p-6">

              {upcomingSchedules.length === 0 ? (

                <div className="py-8 text-center text-sm text-gray-400">
                  예정된 일정이 없습니다.
                </div>

              ) : (

                <div className="space-y-3">

                  {upcomingSchedules.map((schedule) => (

                    <div
                      key={schedule._id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4 transition hover:bg-gray-100"
                    >

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-gray-900">
                          {schedule.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(schedule.date)}
                        </p>

                      </div>

                      <span className="ml-4 shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        {schedule.type}
                      </span>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </section>

        {/* Recent Companies */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>

              <h2 className="font-bold text-gray-900">
                최근 지원 기업
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                최근 등록한 지원 기업입니다.
              </p>

            </div>

            <Link
              href="/companies"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              기업 관리
            </Link>

          </div>

          <div className="overflow-x-auto">

            {recentCompanies.length === 0 ? (

              <div className="px-6 py-12 text-center text-sm text-gray-400">
                아직 등록된 지원 기업이 없습니다.
              </div>

            ) : (

              <table className="w-full min-w-[600px] text-sm">

                <thead>

                  <tr className="border-b border-gray-100 text-left text-xs text-gray-400">

                    <th className="px-6 py-4 font-medium">
                      기업명
                    </th>

                    <th className="px-6 py-4 font-medium">
                      상태
                    </th>

                    <th className="px-6 py-4 font-medium">
                      지원 마감
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentCompanies.map((company) => (

                    <tr
                      key={company._id}
                      className="border-b border-gray-50 last:border-0"
                    >

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {company.name}
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
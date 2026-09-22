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

type Company = {
  _id: string;
  name: string;
  status: string;
  deadline?: string;
  createdAt: string;
};

type Schedule = {
  _id: string;
  title: string;
  date: string;
  type: string;
  memo?: string;
};

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("homewardUser");

    if (!savedUser) {
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("사용자 정보 오류:", error);
      localStorage.removeItem("homewardUser");
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);

        const companyResponse = await fetch(
          `/api/companies?userId=${user.id}`
        );

        const companyData = await companyResponse.json();

        if (companyData.success) {
          setCompanies(companyData.companies);
        }

        const scheduleResponse = await fetch(
          `/api/schedules?userId=${user.id}`
        );

        const scheduleData = await scheduleResponse.json();

        if (scheduleData.success) {
          setSchedules(scheduleData.schedules);
        }
      } catch (error) {
        console.error("홈 데이터 불러오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("homewardUser");

    setUser(null);
    setCompanies([]);
    setSchedules([]);

    router.push("/login");
  };

  const getDDay = (date?: string) => {
    if (!date) {
      return "-";
    }

    const targetDate = new Date(date);
    const today = new Date();

    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff =
      targetDate.getTime() - today.getTime();

    const days = Math.ceil(
      diff / (1000 * 60 * 60 * 24)
    );

    if (days > 0) {
      return `D-${days}`;
    }

    if (days === 0) {
      return "D-Day";
    }

    return `D+${Math.abs(days)}`;
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    const targetDate = new Date(date);

    return targetDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const upcomingSchedules = [...schedules]
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
    .filter((schedule) => {
      const target = new Date(schedule.date);
      const today = new Date();

      target.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return target.getTime() >= today.getTime();
    })
    .slice(0, 3);

  const recentCompanies = companies.slice(0, 3);

  // 로그인하지 않은 상태
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="text-2xl font-bold"
            >
              🏠 Homeward
            </Link>

            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                로그인
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                회원가입
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500">
              Career & D-Day Management
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight">
              집가는 날
            </h1>

            <p className="mt-5 text-lg text-gray-500">
              군대 전역일과 취업 준비를
              <br />
              한 곳에서 관리하세요.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
              >
                시작하기
              </Link>

              <Link
                href="/login"
                className="rounded-xl border bg-white px-6 py-3 font-medium hover:bg-gray-50"
              >
                로그인
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // 로그인한 상태
  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold"
          >
            🏠 Homeward
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/companies"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              기업 관리
            </Link>

            <Link
              href="/schedules"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              일정 관리
            </Link>

            <Link
              href="/statistics"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              통계
            </Link>

            <Link
              href="/mypage"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              👤 마이페이지
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* 환영 문구 */}
        <div>
          <p className="text-sm text-gray-500">
            Career & D-Day Management
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {user.name}님, 환영합니다 👋
          </h1>

          <p className="mt-2 text-gray-500">
            오늘도 취업 준비를 차근차근 진행해보세요.
          </p>
        </div>

        {/* 전역 D-Day */}
        <section className="mt-8 rounded-2xl bg-black p-8 text-white">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-gray-400">
                나의 전역 예정일
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {user.dischargeDate
                  ? formatDate(user.dischargeDate)
                  : "전역일을 등록해주세요"}
              </h2>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm text-gray-400">
                전역 D-Day
              </p>

              <p className="mt-1 text-4xl font-bold">
                {getDDay(user.dischargeDate)}
              </p>
            </div>
          </div>
        </section>

        {/* 요약 카드 */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              등록 기업
            </p>

            <p className="mt-2 text-3xl font-bold">
              {isLoading ? "-" : companies.length}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              지원 기업 관리
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              예정 일정
            </p>

            <p className="mt-2 text-3xl font-bold">
              {isLoading
                ? "-"
                : upcomingSchedules.length}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              다가오는 일정
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              취업 준비
            </p>

            <p className="mt-2 text-3xl font-bold">
              START
            </p>

            <p className="mt-1 text-sm text-gray-400">
              목표를 향해 한 걸음씩
            </p>
          </div>
        </section>

        {/* 일정 + 최근 기업 */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {/* 일정 관리 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  📅 일정 관리
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  다가오는 일정을 확인하세요.
                </p>
              </div>

              <Link
                href="/schedules"
                className="text-sm font-medium text-gray-500 hover:text-black"
              >
                전체 보기 →
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {isLoading ? (
                <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">
                  일정을 불러오는 중...
                </div>
              ) : upcomingSchedules.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    등록된 일정이 없습니다.
                  </p>

                  <Link
                    href="/schedules"
                    className="mt-3 inline-block text-sm font-medium underline"
                  >
                    일정 등록하기
                  </Link>
                </div>
              ) : (
                upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule._id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium">
                          {schedule.type}
                        </span>

                        <p className="truncate font-medium">
                          {schedule.title}
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {formatDate(schedule.date)}
                      </p>
                    </div>

                    <p className="ml-4 whitespace-nowrap text-sm font-semibold">
                      {getDDay(schedule.date)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 최근 기업 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  🏢 최근 기업
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  최근 등록한 기업입니다.
                </p>
              </div>

              <Link
                href="/companies"
                className="text-sm font-medium text-gray-500 hover:text-black"
              >
                전체 보기 →
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {isLoading ? (
                <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">
                  기업 정보를 불러오는 중...
                </div>
              ) : recentCompanies.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    등록된 기업이 없습니다.
                  </p>

                  <Link
                    href="/companies"
                    className="mt-3 inline-block text-sm font-medium underline"
                  >
                    기업 등록하기
                  </Link>
                </div>
              ) : (
                recentCompanies.map((company) => (
                  <div
                    key={company._id}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {company.name}
                      </p>

                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                        {company.status}
                      </span>
                    </div>

                    {company.deadline && (
                      <p className="mt-2 text-sm text-gray-500">
                        📅 지원 마감일{" "}
                        {formatDate(company.deadline)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">
            빠른 메뉴
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {/* 기업 관리 */}
            <Link
              href="/companies"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-2xl">🏢</p>

              <h3 className="mt-4 font-bold">
                기업 관리
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                지원 기업을 등록하고 관리하세요.
              </p>
            </Link>

            {/* 일정 관리 */}
            <Link
              href="/schedules"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-2xl">📅</p>

              <h3 className="mt-4 font-bold">
                일정 관리
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                면접, 시험, 지원 마감일을 관리하세요.
              </p>
            </Link>

            {/* 통계 */}
            <Link
              href="/statistics"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-2xl">📊</p>

              <h3 className="mt-4 font-bold">
                통계
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                취업 준비 현황을 한눈에 확인하세요.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
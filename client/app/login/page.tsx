"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("homewardUser");

    if (savedUser) {
      router.replace("/dashboard");
      return;
    }

    setChecking(false);
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "이메일 또는 비밀번호가 올바르지 않습니다."
        );
        return;
      }

      localStorage.setItem(
        "homewardUser",
        JSON.stringify(data.user)
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("로그인 오류:", error);

      setError(
        "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <Link
            href="/"
            className="text-3xl font-bold tracking-tight text-gray-900 transition hover:text-blue-600"
          >
            Homeward
          </Link>

          <p className="mt-2 text-sm text-gray-500">
            Career & D-Day Management
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">

          <div className="mb-8">

            <h1 className="text-2xl font-bold text-gray-900">
              로그인
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Homeward에 로그인하고 취업 준비를 관리하세요.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                이메일
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>

              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>

          </form>

          {/* Signup */}
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">

            <p className="text-sm text-gray-500">
              아직 계정이 없으신가요?
            </p>

            <Link
              href="/signup"
              className="mt-2 inline-block text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              회원가입하기 →
            </Link>

          </div>

        </div>

        {/* Back */}
        <div className="mt-6 text-center">

          <Link
            href="/"
            className="text-sm text-gray-400 transition hover:text-gray-600"
          >
            ← 홈으로 돌아가기
          </Link>

        </div>

      </div>

    </main>
  );
}
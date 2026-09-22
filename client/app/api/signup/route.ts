import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, dischargeDate } = body;

    // 필수값 확인
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "이름, 이메일, 비밀번호를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // 이미 가입된 이메일인지 확인
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "이미 가입된 이메일입니다.",
        },
        { status: 409 }
      );
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 회원 생성
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      dischargeDate: dischargeDate || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          dischargeDate: user.dischargeDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "회원가입 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function PATCH(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const userId = String(body.userId || "");
    const name = String(body.name || "").trim();
    const dischargeDate = body.dischargeDate;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "사용자 정보가 없습니다.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "이름을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    user.name = name;

    if (dischargeDate) {
      user.dischargeDate = new Date(dischargeDate);
    } else {
      user.dischargeDate = undefined;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "정보가 수정되었습니다.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        dischargeDate: user.dischargeDate,
      },
    });
  } catch (error) {
    console.error("사용자 정보 수정 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "사용자 정보 수정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
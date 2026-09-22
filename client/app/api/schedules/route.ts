import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/lib/models/Schedule";

// ========================================
// 일정 등록
// ========================================
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const userId = String(body.userId || "").trim();
    const title = String(body.title || "").trim();
    const date = body.date;
    const type = String(body.type || "기타").trim();
    const memo = String(body.memo || "").trim();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "일정 제목을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message: "일정 날짜를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const schedule = await Schedule.create({
      userId,
      title,
      date: new Date(date),
      type,
      memo,
    });

    return NextResponse.json(
      {
        success: true,
        message: "일정이 등록되었습니다.",
        schedule: {
          _id: schedule._id.toString(),
          userId: schedule.userId,
          title: schedule.title,
          date: schedule.date,
          type: schedule.type,
          memo: schedule.memo,
          createdAt: schedule.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("일정 등록 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "일정 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// ========================================
// 일정 목록 조회
// ========================================
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const userId = String(
      searchParams.get("userId") || ""
    ).trim();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const schedules = await Schedule.find({
      userId,
    }).sort({
      date: 1,
    });

    return NextResponse.json({
      success: true,
      schedules: schedules.map((schedule) => ({
        _id: schedule._id.toString(),
        userId: schedule.userId,
        title: schedule.title,
        date: schedule.date,
        type: schedule.type,
        memo: schedule.memo,
        createdAt: schedule.createdAt,
      })),
    });
  } catch (error) {
    console.error("일정 조회 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "일정 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// ========================================
// 일정 수정
// ========================================
export async function PUT(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const id = String(body.id || "").trim();
    const userId = String(body.userId || "").trim();
    const title = String(body.title || "").trim();
    const date = body.date;
    const type = String(body.type || "기타").trim();
    const memo = String(body.memo || "").trim();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "일정 ID가 없습니다.",
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "일정 제목을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message: "일정 날짜를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const schedule = await Schedule.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      {
        title,
        date: new Date(date),
        type,
        memo,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          message: "일정을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "일정이 수정되었습니다.",
      schedule: {
        _id: schedule._id.toString(),
        userId: schedule.userId,
        title: schedule.title,
        date: schedule.date,
        type: schedule.type,
        memo: schedule.memo,
        createdAt: schedule.createdAt,
      },
    });
  } catch (error) {
    console.error("일정 수정 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "일정 수정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// ========================================
// 일정 삭제
// ========================================
export async function DELETE(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const id = String(body.id || "").trim();
    const userId = String(body.userId || "").trim();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "일정 ID가 없습니다.",
        },
        { status: 400 }
      );
    }

    const schedule = await Schedule.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          message: "일정을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "일정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("일정 삭제 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "일정 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/lib/models/Company";
import Schedule from "@/lib/models/Schedule";

// ========================================
// 기업 등록
// ========================================
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const userId = String(body.userId || "").trim();
    const name = String(body.name || "").trim();
    const jobPostUrl = String(body.jobPostUrl || "").trim();
    const status = String(body.status || "지원 전").trim();

    const deadline =
      body.deadline && String(body.deadline).trim()
        ? new Date(body.deadline)
        : undefined;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "기업명을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // ========================================
    // 기업 등록
    // ========================================
    const company = await Company.create({
      userId,
      name,
      jobPostUrl,
      status,
      deadline,
    });

    // ========================================
    // 지원 마감일이 있으면 일정 자동 등록
    // ========================================
    if (deadline) {
      await Schedule.create({
        userId,
        title: `${name} 지원 마감`,
        date: deadline,
        type: "지원 마감",
        memo: `${name} 채용 지원 마감일`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "기업이 등록되었습니다.",
        company: {
          _id: company._id.toString(),
          userId: company.userId,
          name: company.name,
          jobPostUrl: company.jobPostUrl,
          status: company.status,
          deadline: company.deadline,
          createdAt: company.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("기업 등록 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "기업 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// ========================================
// 기업 목록 조회
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

    const companies = await Company.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      companies: companies.map((company) => ({
        _id: company._id.toString(),
        userId: company.userId,
        name: company.name,
        jobPostUrl: company.jobPostUrl,
        status: company.status || "지원 전",
        deadline: company.deadline,
        createdAt: company.createdAt,
      })),
    });
  } catch (error) {
    console.error("기업 조회 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "기업 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// ========================================
// 기업 수정
// ========================================
export async function PUT(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const id = String(body.id || "").trim();
    const userId = String(body.userId || "").trim();
    const name = String(body.name || "").trim();
    const jobPostUrl = String(body.jobPostUrl || "").trim();
    const status = String(body.status || "지원 전").trim();

    const deadline =
      body.deadline && String(body.deadline).trim()
        ? new Date(body.deadline)
        : undefined;

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
          message: "기업 ID가 없습니다.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "기업명을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // ========================================
    // 기존 기업 확인
    // ========================================
    const oldCompany = await Company.findOne({
      _id: id,
      userId,
    });

    if (!oldCompany) {
      return NextResponse.json(
        {
          success: false,
          message: "기업을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    // ========================================
    // 기업 수정
    // ========================================
    const company = await Company.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      {
        name,
        jobPostUrl,
        status,
        deadline,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "기업을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    // ========================================
    // 기존 지원 마감 일정 찾기
    // ========================================
    const oldSchedule = await Schedule.findOne({
      userId,
      type: "지원 마감",
      title: `${oldCompany.name} 지원 마감`,
    });

    // ========================================
    // 새로운 마감일이 있는 경우
    // ========================================
    if (deadline) {
      if (oldSchedule) {
        // 기존 일정 수정
        await Schedule.findByIdAndUpdate(
          oldSchedule._id,
          {
            title: `${name} 지원 마감`,
            date: deadline,
            type: "지원 마감",
            memo: `${name} 채용 지원 마감일`,
          }
        );
      } else {
        // 기존 일정이 없으면 새로 생성
        await Schedule.create({
          userId,
          title: `${name} 지원 마감`,
          date: deadline,
          type: "지원 마감",
          memo: `${name} 채용 지원 마감일`,
        });
      }
    } else {
      // ========================================
      // 마감일을 삭제한 경우 일정도 삭제
      // ========================================
      if (oldSchedule) {
        await Schedule.findByIdAndDelete(
          oldSchedule._id
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "기업 정보가 수정되었습니다.",
      company: {
        _id: company._id.toString(),
        userId: company.userId,
        name: company.name,
        jobPostUrl: company.jobPostUrl,
        status: company.status,
        deadline: company.deadline,
        createdAt: company.createdAt,
      },
    });
  } catch (error) {
    console.error("기업 수정 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "기업 정보 수정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// ========================================
// 기업 삭제
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
          message: "기업 ID가 없습니다.",
        },
        { status: 400 }
      );
    }

    // ========================================
    // 삭제할 기업 찾기
    // ========================================
    const company = await Company.findOne({
      _id: id,
      userId,
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "기업을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    // ========================================
    // 기업 삭제
    // ========================================
    await Company.findOneAndDelete({
      _id: id,
      userId,
    });

    // ========================================
    // 해당 기업의 지원 마감 일정 삭제
    // ========================================
    await Schedule.deleteOne({
      userId,
      type: "지원 마감",
      title: `${company.name} 지원 마감`,
    });

    return NextResponse.json({
      success: true,
      message: "기업이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("기업 삭제 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "기업 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
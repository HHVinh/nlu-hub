import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Subject from "@/models/Subject";
import Document from "@/models/Document";
import Question from "@/models/Question";
import LostItem from "@/models/LostItem";
import { FACULTIES, GENERAL_SUBJECTS } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, results: { faculties: [], subjects: [], documents: [], questions: [], lostItems: [] } });
    }

    // TUYỆT CHIÊU CÁCH 2: Tìm kiếm các từ không cần đúng thứ tự (Regex Lookahead)
    // Tách từ khóa thành các chữ rời rạc: "đề toán" -> ["đề", "toán"]
    const words = query.trim().split(/\s+/);
    // Ghép lại thành Regex bắt buộc mọi chữ phải xuất hiện: "(?=.*đề)(?=.*toán)"
    const regexPattern = words.map(word => `(?=.*${word})`).join('');
    const regex = new RegExp(regexPattern, "i"); // 'i' là không phân biệt hoa thường

    await connectDB();

    // 1. Tìm Khoa (Tìm trong Array tĩnh)
    const allCategories = [...GENERAL_SUBJECTS, ...FACULTIES];
    const matchedFaculties = allCategories.filter(f => regex.test(f.name) || regex.test(f.description)).map(f => ({
      _id: f.id,
      name: f.name,
      icon: f.icon,
      type: "faculty",
      url: `/khoa/${f.id}`
    }));

    // 2. Tìm trong MongoDB (Dùng Regex để đồng nhất với phần còn lại)
    const [matchedSubjects, matchedDocs, matchedQuestions, matchedLostItems] = await Promise.all([
      Subject.find({ 
        $or: [{ name: regex }, { note: regex }]
      }).limit(3).lean(),
      Document.find({ title: regex }).limit(3).lean(),
      Question.find({ 
        $or: [{ title: regex }, { content: regex }, { tags: regex }]
      }).limit(3).lean(),
      LostItem.find({ 
        $or: [{ title: regex }, { description: regex }]
      }).limit(3).lean(),
    ]);

    const formattedSubjects = matchedSubjects.map((s: any) => ({
      _id: s._id.toString(),
      name: s.name,
      icon: "📚",
      type: "subject",
      url: s.facultyId === "general" 
        ? `/khoa/general/mon-chung/${s._id.toString()}`
        : `/khoa/${s.facultyId}/mon-chuyen-nganh/${s._id.toString()}`
    }));

    const formattedDocs = matchedDocs.map((d: any) => ({
      _id: d._id.toString(),
      name: d.title,
      icon: "📎",
      type: "document",
      url: `/tai-lieu/${d._id.toString()}`
    }));

    const formattedQuestions = matchedQuestions.map((q: any) => ({
      _id: q._id.toString(),
      name: q.title,
      icon: "💬",
      type: "question",
      url: `/qa/${q._id.toString()}`
    }));

    const formattedLostItems = matchedLostItems.map((l: any) => ({
      _id: l._id.toString(),
      name: `[${l.type === "Lost" ? "MẤT ĐỒ" : "NHẶT ĐƯỢC"}] ${l.title}`,
      icon: "🕵️‍♂️",
      type: "lostitem",
      url: `/lost-found`
    }));

    return NextResponse.json({
      success: true,
      results: {
        faculties: matchedFaculties,
        subjects: formattedSubjects,
        documents: formattedDocs,
        questions: formattedQuestions,
        lostItems: formattedLostItems
      }
    });

  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống khi tìm kiếm" }, { status: 500 });
  }
}

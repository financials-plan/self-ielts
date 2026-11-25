import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";

const MAX_BLOB_BYTES = 2_500_000;

export async function POST(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const hasBlob = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim()
  );
  if (!hasBlob) {
    return NextResponse.json({
      uploaded: false,
      cloudConfigured: false,
      message:
        "Vercel Blob chưa cấu hình — bản ghi được giữ an toàn trên IndexedDB trình duyệt (0đ).",
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "FormData tải lên âm thanh không hợp lệ." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Thiếu tệp âm thanh Speaking." },
      { status: 400 }
    );
  }

  if (file.size <= 0 || file.size > MAX_BLOB_BYTES) {
    return NextResponse.json(
      { error: "Kích thước tệp audio phải nhỏ hơn 2.5 MB (Opus 24kbps)." },
      { status: 400 }
    );
  }

  const mime = file.type || "audio/webm";
  if (!mime.startsWith("audio/")) {
    return NextResponse.json(
      { error: "Chỉ chấp nhận định dạng audio hợp lệ." },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id.replace(/[^a-zA-Z0-9_-]/g, "");
  const pathname = `speaking/${userId}/${crypto.randomUUID()}.webm`;

  try {
    const blobResult = await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: mime,
    });

    return NextResponse.json({
      uploaded: true,
      cloudConfigured: true,
      url: blobResult.pathname || blobResult.url,
      sizeBytes: file.size,
    });
  } catch {
    return NextResponse.json(
      {
        uploaded: false,
        cloudConfigured: true,
        error: "Lỗi mạng khi tải lên Vercel Blob Free.",
      },
      { status: 502 }
    );
  }
}

// lib/uploadFile.ts

export async function uploadFile(file: File): Promise<{ url: string; filename: string } | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) throw new Error("Failed to upload");
  
      const data = await res.json();
      return {
        url: data.url, // URL สำหรับ preview หรือ save ลง DB
        filename: data.filename, // ชื่อไฟล์
      };
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  }
  



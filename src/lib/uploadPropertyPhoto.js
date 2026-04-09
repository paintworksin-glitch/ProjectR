import { supabase } from "@/lib/supabaseClient";

/** Upload an image to the public `property-photos` bucket (listing photos and agent logos). */
export async function uploadPropertyPhoto(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { error } = await supabase.storage.from("property-photos").upload(name, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("property-photos").getPublicUrl(name);
  return data.publicUrl;
}

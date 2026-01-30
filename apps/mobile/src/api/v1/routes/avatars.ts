import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

const BUCKET = "avatars";
const AVATAR_EXTS = ["jpg", "png", "webp", "heic", "heif"] as const;
type AvatarExt = (typeof AVATAR_EXTS)[number];

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

function extFromMime(mimeType?: string): AvatarExt | null {
  if (!mimeType) return null;
  const m = mimeType.toLowerCase();
  if (m === "image/jpeg" || m === "image/jpg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/heic") return "heic";
  if (m === "image/heif") return "heif";
  return null;
}

function extFromUri(uri: string): AvatarExt | null {
  const clean = uri.split("?")[0];
  const last = clean.split(".").pop()?.toLowerCase();
  if (!last) return null;
  if (last === "jpeg") return "jpg";
  if ((AVATAR_EXTS as readonly string[]).includes(last)) return last as AvatarExt;
  return null;
}

function contentTypeFromExt(ext: AvatarExt): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function avatarObjectPath(uid: string, ext: AvatarExt) {
  return `${uid}/avatar.${ext}`;
}

async function removeStrict(paths: string[]) {
  if (!paths.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}

export const avatars = {
  async uploadMyAvatarFromUri(params: { uri: string; contentType?: string }) {
    const uid = await requireUserId();

    const info = await FileSystem.getInfoAsync(params.uri);
    if (!info.exists) throw new Error(`Avatar file not accessible at uri: ${params.uri}`);

    const ext: AvatarExt = extFromMime(params.contentType) ?? extFromUri(params.uri) ?? "jpg";
    const objectPath = avatarObjectPath(uid, ext);

    const base64 = await FileSystem.readAsStringAsync(params.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64);

    const contentType = (params.contentType ?? contentTypeFromExt(ext)).toLowerCase();

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, arrayBuffer, {
      contentType,
      upsert: true,
      cacheControl: "60",
    });
    if (uploadError) throw uploadError;

    // Delete other avatar.* variants after upload succeeds.
    const otherPaths = AVATAR_EXTS.filter((e) => e !== ext).map((e) => avatarObjectPath(uid, e));
    await removeStrict(otherPaths);

    return { path: objectPath };
  },

  async createSignedUrl(path: string, expiresInSeconds: number) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  },
};

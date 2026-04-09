import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

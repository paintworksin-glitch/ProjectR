import { describe, expect, test } from "vitest";
import { safeNextPath } from "@/lib/safeNextPath";
import { escapeHtml, safeEmailSubject } from "@/lib/escapeHtml";

describe("security utility guards", () => {
  test("safeNextPath blocks protocol-relative URLs", () => {
    expect(safeNextPath("//evil.com", "/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/dashboard", "/dashboard")).toBe("/dashboard");
  });

  test("escapeHtml escapes HTML entities", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  test("safeEmailSubject strips newlines/control chars", () => {
    expect(safeEmailSubject("Hello\r\nWorld")).toBe("Hello World");
  });
});

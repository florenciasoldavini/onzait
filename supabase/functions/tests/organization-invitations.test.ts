import { createHandler } from "../organization-invitations/index.ts";
import { AuthenticationError } from "../_shared/auth.ts";
import { buildOrganizationInvitationEmail } from "../_shared/email/organization-invitation.tsx";

function assert(value: unknown, message = "Assertion failed"): asserts value {
  if (!value) throw new Error(message);
}

Deno.test("restricted test senders return actionable setup feedback", async () => {
  const { handler, marks } = setup({
    from: "Onzait <onboarding@resend.dev>",
    send: (() =>
      Promise.resolve(
        new Response("provider details", { status: 403 }),
      )) as typeof fetch,
  });
  const response = await handler(request());
  assert((await response.json()).code === "INVITATION_SENDER_NOT_CONFIGURED");
  assert(marks.join() === "failed");
});
const organizationId = "00000000-0000-4000-8000-000000000001";
const invitation = {
  id: "00000000-0000-4000-8000-000000000002",
  status: "pending" as const,
  token: "secret-token-only-in-email",
  invited_email: "recipient@example.com",
  role_code: "member" as const,
  expires_at: "2026-09-24T12:00:00Z",
  language_code: "en",
  delivery_version: 2,
  organization_name: "Studio <North>",
  inviter_name: "Ana",
};
function request(
  body: unknown = {
    action: "invite",
    organizationId,
    email: "Recipient@Example.com",
    roleCode: "member",
    language: "en",
  },
) {
  return new Request("http://localhost/organization-invitations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
function setup(overrides: Partial<Parameters<typeof createHandler>[0]> = {}) {
  const marks: string[] = [];
  const sends: RequestInit[] = [];
  const reservations: unknown[] = [];
  const handler = createHandler({
    apiKey: "fake-test-key",
    from: "Onzait <test@example.com>",
    siteUrl: "https://onzait.example",
    authenticate: () => Promise.resolve({ id: "sender" }),
    reserve: (_request, input) => {
      reservations.push(input);
      return Promise.resolve({ data: invitation, error: null });
    },
    mark: (_invitation, state) => {
      marks.push(state);
      return Promise.resolve();
    },
    send: ((_url: unknown, init: RequestInit) => {
      sends.push(init);
      return Promise.resolve(new Response('{"id":"email-1"}', { status: 200 }));
    }) as typeof fetch,
    ...overrides,
  });
  return { handler, marks, sends, reservations };
}

Deno.test("organization invitation sends localized email before reporting success and never returns its token", async () => {
  const { handler, marks, sends, reservations } = setup();
  const response = await handler(request());
  assert(response.status === 200);
  assert(marks.join() === "sent");
  assert(sends.length === 1);
  assert(
    (sends[0].headers as Record<string, string>)["Idempotency-Key"].endsWith(
      "-2",
    ),
  );
  assert(sends[0].signal instanceof AbortSignal);
  const email = JSON.parse(String(sends[0].body));
  assert(email.to === "recipient@example.com");
  assert(email.html.includes("/organization-invitations/accept#token="));
  assert(email.html.includes("Studio &lt;North&gt;"));
  assert(email.text.includes("Join Studio <North>"));
  assert(
    JSON.stringify(reservations).includes('"p_email":"recipient@example.com"'),
  );
  assert(!(await response.text()).includes(invitation.token));
});

Deno.test("unauthenticated and malformed organization invitations cannot reserve or send", async () => {
  const unauthorized = setup({
    authenticate: () => Promise.reject(new AuthenticationError("Sign in")),
  });
  assert((await unauthorized.handler(request())).status === 401);
  assert(
    unauthorized.sends.length === 0 && unauthorized.reservations.length === 0,
  );
  const invalid = setup();
  assert(
    (await invalid.handler(
      request({
        action: "invite",
        organizationId,
        email: "not-email",
        roleCode: "owner",
      }),
    )).status === 400,
  );
  assert(invalid.reservations.length === 0);
});

Deno.test("organization delivery failures retain the invitation and expose only a stable error", async () => {
  const { handler, marks } = setup({
    send: (() =>
      Promise.resolve(
        new Response("secret provider details", { status: 403 }),
      )) as typeof fetch,
  });
  const response = await handler(request());
  assert(response.status === 502);
  assert(marks.join() === "failed");
  assert((await response.json()).code === "INVITATION_DELIVERY_FAILED");
});

Deno.test("organization rate limits, denied access and existing members never reach the email provider", async () => {
  for (
    const [code, status] of [["P0429", 429], ["42501", 403], [
      "P0002",
      404,
    ]] as const
  ) {
    const { handler, sends } = setup({
      reserve: () => Promise.resolve({ data: null, error: { code } }),
    });
    assert((await handler(request())).status === status);
    assert(sends.length === 0);
  }
  const existing = setup({
    reserve: () =>
      Promise.resolve({ data: { status: "already_member" }, error: null }),
  });
  assert((await existing.handler(request())).status === 200);
  assert(existing.sends.length === 0);
});

Deno.test("resend uses stored recipient and language, ignoring client overrides", async () => {
  const { handler, reservations, sends } = setup();
  const response = await handler(
    request({
      action: "resend",
      organizationId,
      invitationId: invitation.id,
      email: "attacker@example.com",
      language: "es",
    }),
  );
  assert(response.status === 200);
  assert(
    JSON.stringify(reservations) ===
      JSON.stringify([{
        p_organization_id: organizationId,
        p_invitation_id: invitation.id,
      }]),
  );
  const email = JSON.parse(String(sends[0].body));
  assert(
    email.to === invitation.invited_email && email.html.includes('lang="en"'),
  );
});

Deno.test("provider acceptance with a state-write failure is not reported as a failed email", async () => {
  const { handler } = setup({
    mark: () => Promise.reject(new Error("db unavailable")),
  });
  const response = await handler(request());
  assert((await response.json()).code === "INVITATION_STATUS_UNCONFIRMED");
});

Deno.test("missing configuration and transport failures settle without false success", async () => {
  const missing = setup({ apiKey: undefined });
  assert((await missing.handler(request())).status === 503);
  assert(missing.reservations.length === 0);
  const timeout = setup({
    send: (() =>
      Promise.reject(
        new DOMException("Timed out", "TimeoutError"),
      )) as typeof fetch,
  });
  assert((await timeout.handler(request())).status === 502);
  assert(timeout.marks.join() === "failed");
});

Deno.test("organization invitation emails render Spanish, English and Spanish fallback", async () => {
  for (const language of ["es", "en", "fr"]) {
    const email = await buildOrganizationInvitationEmail({
      acceptUrl:
        "https://onzait.example/organization-invitations/accept#token=test",
      expiresAt: invitation.expires_at,
      inviterName: "Ana",
      organizationName: "Estudio",
      roleCode: "admin",
      language,
    });
    assert(email.html.includes(`lang="${language === "en" ? "en" : "es"}"`));
    assert(email.html.includes(language === "en" ? "Admin" : "Administrador"));
    assert(email.html.includes("UTC") && email.text.includes("#token=test"));
  }
});

import { welcomeEmailFailureResponse } from "../welcome-to-onzait/errors.ts";

function assertEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }.`,
    );
  }
}

Deno.test("welcome email configuration failures hide internal terminology", async () => {
  const response = welcomeEmailFailureResponse("configuration");
  const body = await response.json();

  assertEquals(response.status, 503);
  assertEquals(body, {
    code: "WELCOME_EMAIL_UNAVAILABLE",
    error:
      "Welcome emails are temporarily unavailable. You can continue using Onzait and try again later.",
  });
});

Deno.test("welcome email delivery failures hide provider details", async () => {
  const response = welcomeEmailFailureResponse("delivery");
  const body = await response.json();

  assertEquals(response.status, 502);
  assertEquals(body, {
    code: "WELCOME_EMAIL_DELIVERY_FAILED",
    error:
      "Your account is ready, but we couldn't send the welcome email. You can continue using Onzait.",
  });
  assertEquals("details" in body, false);
});

export async function getMapsFunctionErrorMessage(error: unknown) {
  const response = getFunctionErrorResponse(error);

  if (response) {
    const payload = await response
      .clone()
      .json()
      .catch(() => null);
    const message = getFunctionErrorMessage(payload);

    if (message) {
      return message;
    }
  }

  return null;
}

function getFunctionErrorResponse(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "context" in error &&
    (error as { context?: unknown }).context instanceof Response
  ) {
    return (error as { context: Response }).context;
  }

  return null;
}

function getFunctionErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const error = (payload as { error?: unknown }).error;
  const message = (payload as { message?: unknown }).message;

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return null;
}

export class FetchError extends Error {}

export async function parseErrorResponse(
  response: Response
): Promise<Response> {
  let message = "Unknown error";

  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await response.json();
      message = JSON.stringify(json);
    } else {
      message = await response.text();
    }
  } catch {
    message = "Failed to parse error body";
  }

  return new Response(message, {
    status: response.status,
    statusText: response.statusText || message,
  });
}

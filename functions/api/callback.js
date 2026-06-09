export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const siteOrigin = env.SITE_ORIGIN || "https://garden2k.com";

  if (!code) {
    return new Response("Missing GitHub OAuth code", { status: 400 });
  }

  if (!state) {
    return new Response("Missing state parameter", { status: 400 });
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const storedState = cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]+)/)?.[1];

  if (!storedState || storedState !== state) {
    return new Response("Invalid state parameter", { status: 403 });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "garden2k-decap-cms",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    return new Response(
      JSON.stringify({
        error: tokenData.error || "oauth_token_exchange_failed",
        error_description:
          tokenData.error_description || "GitHub OAuth token exchange failed.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const payload = JSON.stringify({
    token: tokenData.access_token,
    provider: "github",
    state,
  });

  const safePayload = JSON.stringify(payload);
  const safeOrigin = JSON.stringify(siteOrigin);

  return new Response(
    `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        var payload = ${safePayload};
        var targetOrigin = ${safeOrigin};

        if (window.opener) {
          window.opener.postMessage(
            "authorization:github:success:" + payload,
            targetOrigin
          );
          window.close();
        } else {
          document.body.innerText = "Authentication complete. You can close this tab.";
        }
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie":
          "oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/",
      },
    }
  );
}
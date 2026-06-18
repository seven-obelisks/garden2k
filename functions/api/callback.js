export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const siteOrigin = env.SITE_ORIGIN || "https://garden2k.com";

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response("GitHub OAuth is not configured.", {
      status: 500,
      headers: baseHeaders(),
    });
  }

  const allowedUsers = (env.ALLOWED_GITHUB_USERS || "")
    .split(",")
    .map((user) => user.trim().toLowerCase())
    .filter(Boolean);

  if (allowedUsers.length === 0) {
    return new Response(
      "CMS login is not configured. No authorized users defined.",
      {
        status: 500,
        headers: baseHeaders(),
      }
    );
  }

  if (!code) {
    return new Response("Missing GitHub OAuth code", {
      status: 400,
      headers: baseHeaders(),
    });
  }

  if (!state) {
    return new Response("Missing state parameter", {
      status: 400,
      headers: baseHeaders(),
    });
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const storedState =
    cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]+)/)?.[1];

  if (!storedState || storedState !== state) {
    return new Response("Invalid state parameter", {
      status: 403,
      headers: baseHeaders(),
    });
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "garden2k-sveltia-cms",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  let tokenData;

  try {
    tokenData = await tokenResponse.json();
  } catch {
    return new Response("Invalid GitHub OAuth response", {
      status: 502,
      headers: baseHeaders(),
    });
  }

  if (!tokenResponse.ok || !tokenData.access_token) {
    return new Response(
      JSON.stringify({
        error: "oauth_token_exchange_failed",
        error_description: "Authentication failed. Please try again.",
      }),
      {
        status: 500,
        headers: jsonHeaders(),
      }
    );
  }

  const userResponse = await fetch("https://api.github.com/user", {
    signal: AbortSignal.timeout(8000),
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "garden2k-sveltia-cms",
    },
  });

  if (!userResponse.ok) {
    return new Response("Could not verify GitHub user", {
      status: 500,
      headers: baseHeaders(),
    });
  }

  const user = await userResponse.json();
  const login = String(user.login || "").toLowerCase();

  if (!allowedUsers.includes(login)) {
    await revokeGitHubToken(env, tokenData.access_token);

    return new Response("Unauthorized GitHub user", {
      status: 403,
      headers: baseHeaders(),
    });
  }

  const messagePayload = JSON.stringify({
    token: tokenData.access_token,
    provider: "github",
  });

  const safeMessage = JSON.stringify(
    "authorization:github:success:" + messagePayload
  );

  const safeOrigin = JSON.stringify(siteOrigin);

  return new Response(
    `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        var message = ${safeMessage};
        var targetOrigin = ${safeOrigin};

        if (window.opener && window.opener.postMessage) {
          window.opener.postMessage(message, targetOrigin);
        }

        setTimeout(function () {
          window.close();
        }, 500);
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        ...baseHeaders(),
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie":
          "oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      },
    }
  );
}

async function revokeGitHubToken(env, accessToken) {
  try {
    const credentials = btoa(
      `${env.GITHUB_CLIENT_ID}:${env.GITHUB_CLIENT_SECRET}`
    );

    await fetch(
      `https://api.github.com/applications/${env.GITHUB_CLIENT_ID}/token`,
      {
        method: "DELETE",
        signal: AbortSignal.timeout(8000),
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "garden2k-sveltia-cms",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );
  } catch {
    // Best-effort cleanup.
  }
}

function baseHeaders() {
  return {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
  };
}

function jsonHeaders() {
  return {
    ...baseHeaders(),
    "Content-Type": "application/json",
  };
}
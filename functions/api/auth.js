export async function onRequestGet(context) {
  const { env } = context;

  if (!env.GITHUB_CLIENT_ID) {
    return new Response("GitHub OAuth is not configured.", {
      status: 500,
      headers: baseHeaders(),
    });
  }

  const redirectUri =
    env.REDIRECT_URI || "https://garden2k.com/api/callback";

  const allowedRedirectOrigins = ["https://garden2k.com"];
  const redirectOrigin = new URL(redirectUri).origin;

  if (!allowedRedirectOrigins.includes(redirectOrigin)) {
    return new Response("Invalid redirect URI configured.", {
      status: 500,
      headers: baseHeaders(),
    });
  }

  // public_repo is sufficient for a public repository.
  // Use "repo" only if the repository is private.
  const scope = "public_repo";

  const state = crypto.randomUUID();

  const authUrl = new URL(
    "https://github.com/login/oauth/authorize"
  );

  authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      "Set-Cookie":
        `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`,
      ...baseHeaders(),
    },
  });
}

function baseHeaders() {
  return {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
  };
}
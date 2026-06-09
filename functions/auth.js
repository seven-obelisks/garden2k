export async function onRequestGet(context) {
  const { env } = context;

  const scope = "repo";
  const state = crypto.randomUUID();
  const redirectUri =
    env.REDIRECT_URI || "https://garden2k.com/api/callback";

  const authUrl = new URL("https://github.com/login/oauth/authorize");
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
      "Cache-Control": "no-store",
    },
  });
}
import type { InputName, RuleTable } from "../grade";
import rulesV1 from "../../rules/v1.json";
import { randomToken } from "./crypto";
import type { Mailer } from "./email";
import * as follow from "./follow";
import { cardSvg } from "./og";
import { BRAND, day, postButton, renderManage, renderMessage, renderProject, sortedReasons, type ProjectView } from "./render";
import * as store from "./store";
import type { D1Like } from "./store";

export interface Env {
  DB: D1Like;
  EMAIL: Mailer;
  SECRET: string;
  FROM_ADDRESS: string;
  PUBLIC_ORIGIN?: string;
}

const RULE_TABLES: Record<string, RuleTable> = { v1: rulesV1 as RuleTable };

function ruleInputs(version: string): Record<string, InputName> {
  const table = RULE_TABLES[version] ?? RULE_TABLES.v1;
  return Object.fromEntries(table.rules.map((r) => [r.id, r.input]));
}

function html(body: string, nonce: string, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-content-type-options": "nosniff",
      ...extra,
    },
  });
}

const redirect = (to: string) => new Response(null, { status: 303, headers: { location: to } });

async function formOf(req: Request): Promise<URLSearchParams> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
    const fd = await req.formData();
    const out = new URLSearchParams();
    fd.forEach((v, k) => out.append(k, typeof v === "string" ? v : ""));
    return out;
  }
  return new URLSearchParams(await req.text());
}

export async function handle(req: Request, env: Env, now: () => number = () => Math.floor(Date.now() / 1000)): Promise<Response> {
  const url = new URL(req.url);
  const origin = env.PUBLIC_ORIGIN ?? url.origin;
  const nonce = randomToken(16);
  const deps: follow.Deps = { db: env.DB, mailer: env.EMAIL, secret: env.SECRET, from: env.FROM_ADDRESS, origin, now };
  const path = url.pathname;
  const notFound = () =>
    html(renderMessage(origin, "Not found", ["We do not have this page. Search for a project by name or RERA number."], nonce, '<p><a href="/">Go to search</a></p>'), nonce, 404);

  let m: RegExpExecArray | null;

  if (req.method === "GET" && path === "/") {
    return html(
      renderMessage(origin, BRAND, ["A public report card for under-construction housing projects, graded only from filings on state RERA websites.", "Search is coming soon. Open a project link to see its grade."], nonce),
      nonce,
    );
  }

  if (req.method === "GET" && (m = /^\/p\/([a-z]{2})\/([a-z0-9-]+)$/.exec(path))) {
    const project = await store.projectBySlug(env.DB, m[1], m[2]);
    if (!project) return notFound();
    const g = await store.latestGrade(env.DB, project.id);
    const f = url.searchParams.get("f");
    const view: ProjectView = {
      origin,
      state: project.state,
      slug: project.slug,
      regno: project.regno,
      name: project.name,
      promoter: project.promoter,
      district: project.district,
      locality: project.locality,
      status: project.status,
      sourceName: project.source_name,
      sourceUrl: project.source_url,
      readAt: project.last_read_at,
      grade: g?.grade ?? null,
      filingsRead: g?.filingsRead ?? 0,
      ruleInputs: ruleInputs(g?.grade.rulesVersion ?? "v1"),
      followState: f === "sent" || f === "invalid" || f === "limited" ? f : null,
    };
    return html(renderProject(view, nonce), nonce, 200, { "cache-control": f ? "no-store" : "public, max-age=300" });
  }

  if (req.method === "GET" && (m = /^\/og\/([a-z]{2})\/([a-z0-9-]+)\.svg$/.exec(path))) {
    const project = await store.projectBySlug(env.DB, m[1], m[2]);
    if (!project) return new Response("Not found", { status: 404 });
    const g = await store.latestGrade(env.DB, project.id);
    const top = g?.grade.letter ? sortedReasons(g.grade)[0] : undefined;
    const svg = cardSvg({
      name: project.name,
      regno: project.regno,
      sourceName: project.source_name,
      letter: g?.grade.letter ?? null,
      topReason: top ? `${top.title}, ${day(top.filingDate)}` : null,
    });
    return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }

  if (req.method === "POST" && path === "/api/follow") {
    const form = await formOf(req);
    const project = await store.projectBySlug(env.DB, form.get("state") ?? "", form.get("slug") ?? "");
    if (!project) return notFound();
    const back = `/p/${project.state}/${project.slug}`;
    if (form.get("website")) return redirect(`${back}?f=sent`);
    const client = req.headers.get("cf-connecting-ip") ?? "unknown";
    const result = await follow.requestFollow(deps, project, form.get("email") ?? "", client);
    return redirect(`${back}?f=${result}`);
  }

  if (path === "/follow/confirm") {
    const token = req.method === "POST" ? ((await formOf(req)).get("t") ?? "") : (url.searchParams.get("t") ?? "");
    if (req.method === "GET") {
      return html(renderMessage(origin, "Confirm your follow", ["Press the button to start following this project."], nonce, postButton("/follow/confirm", { t: token }, "Confirm and follow")), nonce, 200, { "cache-control": "no-store" });
    }
    if (req.method === "POST") {
      const r = await follow.confirmFollow(deps, token);
      if (r.kind === "followed") {
        return html(
          renderMessage(origin, "You follow this project", [`We will email you when the record of ${r.project.name} changes, and once each quarter.`], nonce, `<p><a href="/p/${r.project.state}/${r.project.slug}">Back to ${r.project.name}</a> · <a href="/">Follow another project</a></p>`),
          nonce,
        );
      }
      if (r.kind === "expired") return html(renderMessage(origin, "This link has expired", ["Follow again from the project page."], nonce), nonce, 410);
      return html(renderMessage(origin, "This link does not work", ["It may have been used already. Follow again from the project page."], nonce), nonce, 400);
    }
  }

  if ((m = /^\/u\/([A-Za-z0-9_.-]+)$/.exec(path))) {
    if (req.method === "GET") {
      return html(renderMessage(origin, "Unfollow this project", ["Press the button to stop emails about this project."], nonce, postButton(path, {}, "Unfollow")), nonce, 200, { "cache-control": "no-store" });
    }
    if (req.method === "POST") {
      // upstream: RFC 8058 one-click unsubscribe target named in the List-Unsubscribe header. https://www.rfc-editor.org/rfc/rfc8058
      const project = await follow.unfollowByToken(deps, m[1]);
      if (!project) return html(renderMessage(origin, "This link does not work", ["Open the newest email from us and use its link."], nonce), nonce, 400);
      return html(renderMessage(origin, "You no longer follow this project", [`We will not email you about ${project.name} again.`], nonce), nonce);
    }
  }

  if (req.method === "GET" && (m = /^\/follows\/([A-Za-z0-9_.-]+)$/.exec(path))) {
    const followerId = await follow.followerFromManageToken(deps, m[1]);
    if (!followerId) return html(renderMessage(origin, "This link does not work", ["Open the newest email from us and use its link."], nonce), nonce, 400);
    return html(renderManage(origin, m[1], await store.activeFollowsOf(env.DB, followerId), nonce), nonce, 200, { "cache-control": "no-store" });
  }

  if (req.method === "POST" && (path === "/follows/unfollow" || path === "/follows/delete")) {
    const form = await formOf(req);
    const token = form.get("t") ?? "";
    const followerId = await follow.followerFromManageToken(deps, token);
    if (!followerId) return html(renderMessage(origin, "This link does not work", ["Open the newest email from us and use its link."], nonce), nonce, 400);
    if (path === "/follows/delete") {
      await store.deleteFollower(env.DB, followerId);
      return html(renderMessage(origin, "Your email is deleted", ["You follow no projects and we hold no email address for you."], nonce), nonce);
    }
    await follow.unfollowFromManage(deps, followerId, form.get("f") ?? "");
    return redirect(`/follows/${token}`);
  }

  if (req.method === "GET" && (m = /^\/rules\/(v\d+)$/.exec(path))) {
    const table = RULE_TABLES[m[1]];
    if (!table) return notFound();
    return new Response(JSON.stringify(table, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }

  return notFound();
}

export default {
  fetch: (req: Request, env: Env) => handle(req, env),
};

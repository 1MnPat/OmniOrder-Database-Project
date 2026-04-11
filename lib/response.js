export const ok = (data) =>
  Response.json({ success: true, data }, { status: 200 });

export const created = (data) =>
  Response.json({ success: true, data }, { status: 201 });

export const badRequest = (msg) =>
  Response.json({ success: false, error: msg }, { status: 400 });

export const unauthorizedResponse = (msg) =>
  Response.json({ success: false, error: msg }, { status: 401 });

export const forbiddenResponse = (msg) =>
  Response.json({ success: false, error: msg }, { status: 403 });

export const notFound = (msg) =>
  Response.json({ success: false, error: msg }, { status: 404 });

export const conflict = (msg) =>
  Response.json({ success: false, error: msg }, { status: 409 });

export const serverError = (msg) =>
  Response.json({ success: false, error: msg }, { status: 500 });

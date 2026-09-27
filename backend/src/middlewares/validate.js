export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const parsed = schema.parse(req[source]);
    if (source === 'body') req.body = parsed;
    else req.validated = { ...req.validated, [source]: parsed };
    next();
  };

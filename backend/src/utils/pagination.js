export const parsePagination = (queryParams, { defaultSize = 20, maxSize = 100 } = {}) => {
  const page = Math.max(1, Number.parseInt(queryParams.page, 10) || 1);
  const size = Math.min(maxSize, Math.max(1, Number.parseInt(queryParams.size, 10) || defaultSize));
  return { page, size, offset: (page - 1) * size };
};

export const paginated = (items, total, { page, size }) => ({
  items,
  meta: { page, size, total, pages: Math.max(1, Math.ceil(total / size)) },
});

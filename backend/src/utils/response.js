export const paginatedResponse = (res, data, page, limit, total) => {
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error("Pagination limit must be a finite number greater than zero");
  }

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    count: data.length, // Items on this page
    pagination: {
      currentPage: page,
      totalPages,
      total, // Total items in database
      limit, // Items per page
      hasNextPage: page < totalPages, // Is there a next page?
      hasPrevPage: page > 1, // Is there a previous page?
    },
    data,
  });
};

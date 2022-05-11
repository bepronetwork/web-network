const LIMIT = 10

export function calculateTotalPages(count) {
  return Math.ceil(count / LIMIT)
}

function paginate(query = {}, {page = 1,} = {page: 1,}, order = []) {
  page = Math.ceil(page);
  if (page < 1)
    page = 1;
  const offset = (page - 1) * LIMIT;
  return ({
    ...query,
    distinct: true,
    offset,
    limit: LIMIT,
    order,
  })
}

export function paginateArray(items, itemsPerPage, page) {
  const pages = Math.ceil(items.length / itemsPerPage)
  const data = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)

	return {
    pages,
    page,
    data
  }
}

export default paginate;

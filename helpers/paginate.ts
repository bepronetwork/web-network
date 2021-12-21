function paginate(query = {}, {page = 1,} = {page: 1,}, order = []) {
  const limit = 10;
  page = Math.ceil(page);
  if (page < 1)
    page = 1;
  const offset = (page - 1) * limit;
  return ({
    ...query,
    offset,
    limit,
    order,
  })
}

export function paginateArray(items, itemsPerPage, page) {
	return items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
}

export default paginate;

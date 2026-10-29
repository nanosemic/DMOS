
export function assets(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

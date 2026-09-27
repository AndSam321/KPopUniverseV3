export const MIN_LENGTH = 2;

export const SECTIONS = [
  { key: "groups", label: "Groups" },
  { key: "members", label: "Artists" },
  { key: "users", label: "Fans" },
  { key: "posts", label: "Posts" },
];

export const targetFor = (kind, item) => {
  switch (kind) {
    case "groups":
      return `/groups/${item.id}`;
    case "members":
      return `/groups/${item.group.id}`;
    case "users":
      return `/profile/${item.username}`;
    case "posts":
      return `/posts/${item.id}`;
    default:
      return "/";
  }
};

export const imageFor = (kind, item) => {
  if (kind === "groups") return item.logo_url;
  if (kind === "members") return item.photo_url;
  if (kind === "users") return item.avatar_url;
  return null;
};

export const titleFor = (kind, item) => {
  if (kind === "users") return item.username;
  if (kind === "members") return item.stage_name;
  return item.name || item.title;
};

export const subtitleFor = (kind, item) => {
  if (kind === "groups") return item.korean_name;
  if (kind === "members")
    return [item.group?.name, item.position].filter(Boolean).join(" · ");
  if (kind === "users") return item.title;
  if (kind === "posts")
    return [item.groups?.[0]?.name, `@${item.user?.username}`]
      .filter(Boolean)
      .join(" · ");
  return null;
};

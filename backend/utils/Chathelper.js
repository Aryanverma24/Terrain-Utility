export const resolveChatRoles = (chat, currentUserId) => {
  const ownerId = chat.landId?.owner?.toString();

  let owner = null;
  let buyer = null;
  let lawyer = null;

  chat.participants.forEach(p => {
    const pid = p._id.toString();

    if (pid === ownerId) {
      owner = p;
    } else if (p.role === "lawyer") {
      lawyer = p;
    } else {
      buyer = p;
    }
  });

  return { owner, buyer, lawyer };
};
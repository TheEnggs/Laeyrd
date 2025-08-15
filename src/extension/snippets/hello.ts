type User = { id: string; name: string; active: boolean };
function getActive(users: User[]): User[] {
  return users.filter((u) => u.active);
}
export const data = getActive([
  { id: "1", name: "Ada", active: true },
  { id: "2", name: "Grace", active: false },
]);

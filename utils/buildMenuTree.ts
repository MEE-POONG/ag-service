import { MenuWebDB } from "@prisma/client"

// types: เพิ่ม type Node ที่มี children
type MenuNode = MenuWebDB & { children: MenuNode[] }

export const buildMenuTree = (list: MenuWebDB[]): MenuNode[] => {
  const map = new Map<string, MenuNode>()
  const roots: MenuNode[] = []

  // clone + init children
  for (const item of list) {
    map.set(item.id, { ...item, children: [] })
  }

  // ทำความสัมพันธ์แม่-ลูก
  for (const item of list) {
    const node = map.get(item.id)!
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // จัดเรียงตาม showOrder แล้วตามชื่อ
  const sortRec = (nodes: MenuNode[]) => {
    nodes.sort(
      (a, b) =>
        (a.showOrder ?? 0) - (b.showOrder ?? 0) ||
        a.name.localeCompare(b.name, "th")
    )
    nodes.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)

  return roots
}

export default buildMenuTree

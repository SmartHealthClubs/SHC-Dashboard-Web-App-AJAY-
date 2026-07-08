import { createRng } from "@/mock/seed"

const FIRST_NAMES = [
  "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "Lucas", "Mia", "Elijah", "Amelia", "James", "Harper", "Benjamin",
  "Evelyn", "Henry", "Abigail", "Sebastian", "Ella", "Jack", "Scarlett", "Owen",
  "Grace", "Wyatt", "Chloe", "Leo", "Victoria", "Julian",
]

const LAST_NAMES = [
  "Bennett", "Hayes", "Ortiz", "Sullivan", "Fletcher", "Nakamura", "Price",
  "Delgado", "Whitfield", "Marsh", "Osei", "Bianchi", "Kowalski", "Fitzgerald",
  "Novak", "Reyes", "Chandra", "Malone", "Petrov", "Ibarra",
]

const rng = createRng(20260707)

export const MEMBER_NAMES: string[] = Array.from({ length: 60 }, () => {
  return `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`
})

export function memberName(index: number): string {
  return MEMBER_NAMES[index % MEMBER_NAMES.length]
}

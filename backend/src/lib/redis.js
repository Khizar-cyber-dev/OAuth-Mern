import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: 'https://well-mink-13485.upstash.io',
  token: 'ATStAAIncDIwMzY4ZTE5NjUyNjk0ZDYxOTY3MzM5OThmN2YyZWU0YnAyMTM0ODU',
})

await redis.set("foo", "bar");
await redis.get("foo");

export default redis
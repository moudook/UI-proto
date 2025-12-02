import os
import json
import logging
from typing import Optional, Dict, Any

import redis.asyncio as redis


class RedisHandler:
    def __init__(self):
        self.logger = logging.getLogger("RedisHandler")

        # Load Redis credentials from env
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = 0
        self.redis_password = os.getenv("REDIS_PASSWORD", None)

        # Create Redis client
        self.client = redis.Redis(
            host=self.redis_host,
            port=self.redis_port,
            db=self.redis_db,
            password=self.redis_password,
            decode_responses=True,
        )

    # Save a Python dict as JSON to Redis
    async def set_json(self, key: str, value: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        try:
            dump = json.dumps(value)
            if ttl:
                await self.client.set(key, dump, ex=ttl)
            else:
                await self.client.set(key, dump)
            return True
        except Exception as e:
            self.logger.error(f"Redis set_json failed: {e}", exc_info=True)
            return False

    # Fetch a key and return JSON-decoded dict
    async def get_json(self, key: str) -> Optional[Dict[str, Any]]:
        try:
            raw = await self.client.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception as e:
            self.logger.error(f"Redis get_json failed: {e}", exc_info=True)
            return None

    # Delete a key
    async def delete(self, key: str) -> bool:
        try:
            result = await self.client.delete(key)
            return result == 1
        except Exception as e:
            self.logger.error(f"Redis delete failed: {e}", exc_info=True)
            return False

    # Check if a key exists
    async def exists(self, key: str) -> bool:
        try:
            return bool(await self.client.exists(key))
        except Exception as e:
            self.logger.error(f"Redis exists failed: {e}", exc_info=True)
            return False

    # Increment a numeric field inside a JSON object
    async def incr_field(self, key: str, field: str, amount: int = 1) -> Optional[int]:
        try:
            data = await self.get_json(key)
            if not data:
                return None

            value = data.get(field, 0)
            if not isinstance(value, int):
                return None

            data[field] = value + amount
            await self.set_json(key, data)
            return data[field]
        except Exception as e:
            self.logger.error(f"Redis incr_field failed: {e}", exc_info=True)
            return None

    # Close Redis connection
    async def close(self):
        try:
            await self.client.close()
        except Exception as e:
            self.logger.error("Redis close failed", exc_info=True)
            self.logger.debug(f"Error occured: {e}")
            pass

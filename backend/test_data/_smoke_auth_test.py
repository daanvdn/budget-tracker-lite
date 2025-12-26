"""Smoke test to hit auth endpoints in-process via ASGI to ensure app doesn't crash on 400/401."""

import asyncio

from httpx import ASGITransport, AsyncClient

from app.main import app


async def run():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        # Weak password registration (should return 400 with detail, not crash)
        resp = await c.post("/api/auth/register", json={"name": "X", "email": "x@test.com", "password": "weak"})
        print("Register status:", resp.status_code, resp.text)

        # Incorrect login (should return 401)
        resp2 = await c.post("/api/auth/login", json={"email": "noone@test.com", "password": "no"})
        print("Login status:", resp2.status_code, resp2.text)


if __name__ == "__main__":
    asyncio.run(run())

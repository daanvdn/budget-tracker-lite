FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Ensure virtual environment is on PATH
ENV PATH="/app/.venv/bin:${PATH}"

# Ensure Python can import the `app` package from the copied `src/` folder
ENV PYTHONPATH="/app/src:${PYTHONPATH}"

# Copy application code
COPY src/ ./src/

# Expose port
EXPOSE 8000

# Run the application - use the package name `app` (not `src.app`) so imports resolve
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

.PHONY: docker-up docker-down docker-status docker-logs docker-destroy run stop status clean help

# ============================================================
# Docker Compose (Recommended)
# ============================================================

# Start Supabase + App via Docker Compose
docker-up:
	@echo "Starting full stack via Docker Compose..."
	docker compose up -d
	@echo ""
	@echo "Services started:"
	@echo "  App:          http://localhost:8080"
	@echo "  Supabase API: http://localhost:8000"
	@echo "  Studio:       http://localhost:8000 (login with DASHBOARD_USERNAME/DASHBOARD_PASSWORD)"
	@echo "  Mailpit UI:   http://localhost:54324"
	@echo "  Database:     localhost:54322"

# Stop all containers
docker-down:
	@echo "Stopping Docker Compose..."
	docker compose down

# Show running containers
docker-status:
	docker compose ps

# Tail logs for all services
docker-logs:
	docker compose logs -f

# Destroy everything (including volumes/data!)
docker-destroy:
	@echo "WARNING: This will delete all data!"
	docker compose down -v --remove-orphans

# ============================================================
# Supabase CLI (Legacy)
# ============================================================

run:
	@echo "Starting Supabase CLI stack..."
	npx supabase start
	@echo "Starting app..."
	bun dev

stop:
	npx supabase stop

status:
	npx supabase status

# ============================================================
# Misc
# ============================================================

clean:
	rm -rf .temp/

help:
	@echo "Docker Compose commands (recommended):"
	@echo "  make docker-up      - Start all services"
	@echo "  make docker-down    - Stop all services"
	@echo "  make docker-status  - Show service status"
	@echo "  make docker-logs    - Tail service logs"
	@echo "  make docker-destroy - Remove everything (data included!)"
	@echo ""
	@echo "Supabase CLI commands (legacy):"
	@echo "  make run    - Start Supabase CLI + bun dev"
	@echo "  make stop   - Stop Supabase CLI"
	@echo "  make status - Show Supabase CLI status"

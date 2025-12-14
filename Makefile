.PHONY: help dev setup docker-up docker-down docker-logs db-reset clean

dev:
	npm run start:dev

setup:
	npm install
	./setup-database.sh

docker-up:
	./setup-database.sh

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f postgres

db-reset:
	docker-compose down -v
	./setup-database.sh

clean:
	rm -rf node_modules dist
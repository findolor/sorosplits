all:
	make build
	make deploy
	make run

build:
	soroban contract build

deploy:
	. scripts/deploy.sh

run:
	. scripts/run.sh

test:
	cargo test
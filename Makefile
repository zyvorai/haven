.PHONY: crds operators dev prod doctor wait secrets-prod realm-import ui-install ui-dev ui-build

crds:
	kubectl apply -f config/crd/haven.identity_identityplanes.yaml

operators:
	bash deploy/operators/install.sh

dev: crds
	kubectl apply -k deploy/overlays/dev

prod: crds
	@echo "Prod overlay needs secrets + TLS + CNPG CA. See deploy/overlays/prod/README.md"
	kubectl apply -k deploy/overlays/prod

wait:
	bash hack/wait-plane.sh

doctor:
	bash cli/haven doctor platform -n identity

admin:
	bash cli/haven admin platform -n identity

secrets-prod:
	bash hack/gen-prod-secrets.sh

sync-ca:
	bash hack/sync-cnpg-ca.sh

samples-dev:
	kubectl apply -f config/samples/identityplane-dev.yaml

samples-prod:
	kubectl apply -f config/samples/identityplane-prod.yaml

realm-import:
	kubectl apply -f config/samples/keycloakrealmimport-platform.yaml

ui-install:
	cd ui/web && npm install

ui-dev:
	cd ui/web && npm run dev

ui-build:
	cd ui/web && npm run build

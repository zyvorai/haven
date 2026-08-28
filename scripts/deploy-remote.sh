#!/usr/bin/env bash
# Deploy Haven web UI to a remote k3s host via NodePort.
#
# Usage:
#   ./scripts/deploy-remote.sh <host> [user]
#   ./scripts/deploy-remote.sh 175.110.122.71 sus
#   ./scripts/deploy-remote.sh 175.110.122.71 sus --quick
#   ./scripts/deploy-remote.sh 175.110.122.71 sus --uninstall
#
# Environment:
#   HAVEN_NODE_PORT       default 30742
#   HAVEN_IMAGE_TAG       default dev
#   KEYCLOAK_NODE_PORT    default 30180 (existing Keycloak on host)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/deploy-remote-ui.sh
source "${SCRIPT_DIR}/lib/deploy-remote-ui.sh"

QUICK_MODE=false
UNINSTALL_MODE=false
SKIP_SYNC=false
POSITIONAL=()
for arg in "$@"; do
  case "$arg" in
    --quick) QUICK_MODE=true ;;
    --skip-sync) SKIP_SYNC=true ;;
    --uninstall) UNINSTALL_MODE=true ;;
    --help|-h)
      sed -n '2,14p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) POSITIONAL+=("$arg") ;;
  esac
done

HOST="${POSITIONAL[0]:-${DEPLOY_HOST:-}}"
USER="${POSITIONAL[1]:-${DEPLOY_USER:-sus}}"

[ -n "$HOST" ] || error "Usage: $0 <host> [user] [--quick|--uninstall]"

DEPLOYMENTS_SUBDIR="${DEPLOYMENTS_SUBDIR:-.deployment}"
HAVEN_CHECKOUT="${HAVEN_CHECKOUT:-haven}"
HAVEN_IMAGE_TAG="${HAVEN_IMAGE_TAG:-dev}"
NODE_PORT="${HAVEN_NODE_PORT:-30742}"
KEYCLOAK_PORT="${KEYCLOAK_NODE_PORT:-30180}"

REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REMOTE_DIR="\$HOME/${DEPLOYMENTS_SUBDIR}/${HAVEN_CHECKOUT}"
RSYNC_DEST="${USER}@${HOST}:${DEPLOYMENTS_SUBDIR}/${HAVEN_CHECKOUT}/"
REMOTE_SH_PREFIX="cd \"${REMOTE_DIR}\""

_SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=15 -o ServerAliveCountMax=6"
_KUBECONFIG_PREFIX='if [ -r "$HOME/.kube/config" ]; then export KUBECONFIG="$HOME/.kube/config"; fi;'

_ssh() {
  ssh ${_SSH_OPTS} "${USER}@${HOST}" "$_KUBECONFIG_PREFIX" "$@"
}

_rsync() {
  rsync -az --delete \
    -e "ssh ${_SSH_OPTS}" \
    --exclude '.git/' \
    --exclude 'ui/web/node_modules/' \
    --exclude 'ui/web/dist/' \
    "$@"
}

axiom_ui_set_total 6
axiom_ui_banner "Haven Web UI Remote Deploy" "${USER}@${HOST}"
axiom_ui_kv "Checkout" "${DEPLOYMENTS_SUBDIR}/${HAVEN_CHECKOUT}"
axiom_ui_kv "UI" "http://${HOST}:${NODE_PORT}"
axiom_ui_kv "Keycloak" "http://${HOST}:${KEYCLOAK_PORT}/admin"
axiom_ui_kv "NodePort" "${NODE_PORT}"

if $UNINSTALL_MODE; then
  step 1 2 "Remove Haven UI"
  _ssh "${REMOTE_SH_PREFIX}; kubectl delete -f deploy/k8s/ui/deployment.yaml --ignore-not-found; podman rm -f haven-web 2>/dev/null || true" || true
  info "Haven UI removed"
  axiom_ui_success "$HOST" "$USER"
  exit 0
fi

step 1 6 "SSH preflight"
_ssh 'command -v kubectl >/dev/null' || error "kubectl not found on ${HOST}"
info "kubectl OK"

step 2 6 "Rsync source → remote"
if $SKIP_SYNC; then
  warn "Skipping rsync"
else
  _ssh "mkdir -p \"\$HOME/${DEPLOYMENTS_SUBDIR}/${HAVEN_CHECKOUT}\""
  _rsync "${REPO_DIR}/" "${RSYNC_DEST}"
  info "Synced"
fi

step 3 6 "Build + import haven-web image"
if $QUICK_MODE; then
  warn "Skipping image build (--quick)"
else
  _ssh "export HAVEN_IMAGE_TAG='${HAVEN_IMAGE_TAG}'; ${REMOTE_SH_PREFIX}; . scripts/lib/deploy-remote-images.sh; haven_build_web_image"
  info "Image built"
fi

step 4 6 "Apply Kubernetes manifests (NodePort ${NODE_PORT})"
K8S_RESULT=$(_ssh "export HAVEN_HOST='${HOST}'; export HAVEN_NODE_PORT='${NODE_PORT}'; export KEYCLOAK_PORT='${KEYCLOAK_PORT}'; ${REMOTE_SH_PREFIX}; \
python3 - <<'PY'
from pathlib import Path
import os, re

host = os.environ['HAVEN_HOST']
node_port = os.environ['HAVEN_NODE_PORT']
kc_port = os.environ['KEYCLOAK_PORT']

p = Path('deploy/k8s/ui/deployment.yaml')
text = p.read_text()
text = re.sub(r'nodePort: [0-9]+', f'nodePort: {node_port}', text)
text = text.replace('KEYCLOAK_HOST', host)
p.write_text(text)
print(f'nodePort -> {node_port}')
print(f'keycloak -> http://{host}:{kc_port}')
PY
kubectl apply -f deploy/k8s/ui/deployment.yaml
if kubectl -n haven-ui rollout status deploy/haven-web --timeout=120s 2>/dev/null; then
  echo K8S_OK
else
  echo K8S_ROLLOUT_FAILED
fi" | tail -1)
info "Manifests applied (${K8S_RESULT})"

step 5 6 "Verify HTTP (+ podman fallback if CNI broken)"

_ssh "sudo ufw allow ${NODE_PORT}/tcp comment haven-web 2>/dev/null || true" || true

if [ "$K8S_RESULT" = "K8S_ROLLOUT_FAILED" ]; then
  warn "K8s rollout failed (CNI?) — starting podman host container on :${NODE_PORT}"
  _ssh "mkdir -p \"\$HOME/${DEPLOYMENTS_SUBDIR}/${HAVEN_CHECKOUT}/.run\"
cat > \"\$HOME/${DEPLOYMENTS_SUBDIR}/${HAVEN_CHECKOUT}/.run/haven-config.json\" <<EOF
{
  \"keycloakUrl\": \"http://${HOST}:${KEYCLOAK_PORT}\",
  \"keycloakAdminUrl\": \"http://${HOST}:${KEYCLOAK_PORT}/admin\",
  \"keycloakNamespace\": \"argus-enterprise\"
}
EOF
podman rm -f haven-web 2>/dev/null || true
podman run -d --name haven-web -p ${NODE_PORT}:80 \\
  -v \"\$HOME/${DEPLOYMENTS_SUBDIR}/${HAVEN_CHECKOUT}/.run/haven-config.json:/usr/share/nginx/html/config.json:ro,Z\" \\
  localhost/haven-web:${HAVEN_IMAGE_TAG}"
  info "Podman fallback running"
fi

sleep 2
UI_URL="http://${HOST}:${NODE_PORT}"
if curl -fsS --connect-timeout 10 "${UI_URL}/" >/dev/null; then
  info "UI OK: ${UI_URL}"
else
  warn "UI check failed"
  _ssh 'kubectl -n haven-ui get pods,svc -o wide 2>/dev/null; podman ps -a | grep haven' || true
fi

step 6 6 "Done" "$HOST" "$USER"
axiom_ui_panel "Access" \
  "Landing:    ${UI_URL}/" \
  "Console:    ${UI_URL}/deck" \
  "Wizard:     ${UI_URL}/deploy" \
  "Keycloak:   http://${HOST}:${KEYCLOAK_PORT}/admin (already installed)" \
  "" \
  "Redeploy:   ./scripts/deploy-remote.sh ${HOST} ${USER} --quick"

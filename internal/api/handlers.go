package api

import (
	"encoding/json"
	"net/http"

	"github.com/zyvorai/haven/internal/keycloak"
)

type Server struct {
	KC *keycloak.Manager
}

func (s *Server) kc() *keycloak.AdminClient {
	return s.KC.Client()
}

func (s *Server) KeycloakConfig(w http.ResponseWriter, r *http.Request) {
	url, user := s.KC.Config()
	writeJSON(w, http.StatusOK, map[string]string{
		"keycloakUrl": url,
		"adminUser":   user,
	})
}

func (s *Server) ConnectKeycloak(w http.ResponseWriter, r *http.Request) {
	var body struct {
		KeycloakURL string `json:"keycloakUrl"`
		AdminUser   string `json:"adminUser"`
		Password    string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	if err := s.KC.Reconfigure(r.Context(), body.KeycloakURL, body.AdminUser, body.Password); err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	st, err := s.kc().Status(r.Context())
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, st)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeKCError(w http.ResponseWriter, status int, msg string, raw []byte) {
	var kc json.RawMessage
	if len(raw) > 0 {
		kc = json.RawMessage(raw)
	}
	writeJSON(w, status, keycloak.APIError{Error: msg, Keycloak: kc, Status: status})
}

func (s *Server) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) KeycloakStatus(w http.ResponseWriter, r *http.Request) {
	st, err := s.kc().Status(r.Context())
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, st)
}

func (s *Server) ListRealms(w http.ResponseWriter, r *http.Request) {
	realms, err := s.kc().ListRealms(r.Context())
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, realms)
}

func (s *Server) GetRealm(w http.ResponseWriter, r *http.Request, realm string) {
	rl, err := s.kc().GetRealm(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, rl)
}

func (s *Server) CreateRealm(w http.ResponseWriter, r *http.Request) {
	var body keycloak.Realm
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().CreateRealm(r.Context(), body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *Server) UpdateRealm(w http.ResponseWriter, r *http.Request, realm string) {
	var body keycloak.Realm
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().UpdateRealm(r.Context(), realm, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) DeleteRealm(w http.ResponseWriter, r *http.Request, realm string) {
	code, raw, err := s.kc().DeleteRealm(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) ListClients(w http.ResponseWriter, r *http.Request, realm string) {
	clients, err := s.kc().ListClients(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, clients)
}

func (s *Server) GetClient(w http.ResponseWriter, r *http.Request, realm, id string) {
	cl, err := s.kc().GetClient(r.Context(), realm, id)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, cl)
}

func (s *Server) CreateClient(w http.ResponseWriter, r *http.Request, realm string) {
	var body keycloak.Client
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().CreateClient(r.Context(), realm, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *Server) UpdateClient(w http.ResponseWriter, r *http.Request, realm, id string) {
	var body keycloak.Client
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().UpdateClient(r.Context(), realm, id, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) DeleteClient(w http.ResponseWriter, r *http.Request, realm, id string) {
	code, raw, err := s.kc().DeleteClient(r.Context(), realm, id)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) GetClientSecret(w http.ResponseWriter, r *http.Request, realm, id string) {
	sec, err := s.kc().GetClientSecret(r.Context(), realm, id)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, sec)
}

func (s *Server) RegenerateClientSecret(w http.ResponseWriter, r *http.Request, realm, id string) {
	sec, err := s.kc().RegenerateClientSecret(r.Context(), realm, id)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, sec)
}

func (s *Server) ListUsers(w http.ResponseWriter, r *http.Request, realm string) {
	search := r.URL.Query().Get("search")
	users, err := s.kc().ListUsers(r.Context(), realm, search)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, users)
}

func (s *Server) CreateUser(w http.ResponseWriter, r *http.Request, realm string) {
	var body keycloak.User
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().CreateUser(r.Context(), realm, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *Server) UpdateUser(w http.ResponseWriter, r *http.Request, realm, id string) {
	var body keycloak.User
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().UpdateUser(r.Context(), realm, id, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) DeleteUser(w http.ResponseWriter, r *http.Request, realm, id string) {
	code, raw, err := s.kc().DeleteUser(r.Context(), realm, id)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) ResetPassword(w http.ResponseWriter, r *http.Request, realm, id string) {
	var body keycloak.PasswordReset
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().ResetPassword(r.Context(), realm, id, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) ListRoles(w http.ResponseWriter, r *http.Request, realm string) {
	roles, err := s.kc().ListRoles(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, roles)
}

func (s *Server) CreateRole(w http.ResponseWriter, r *http.Request, realm string) {
	var body keycloak.Role
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().CreateRole(r.Context(), realm, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *Server) GetUserRoleMappings(w http.ResponseWriter, r *http.Request, realm, userID string) {
	m, err := s.kc().GetUserRoleMappings(r.Context(), realm, userID)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, m)
}

func (s *Server) AddRealmRoleMappings(w http.ResponseWriter, r *http.Request, realm, userID string) {
	var roles []keycloak.Role
	if err := json.NewDecoder(r.Body).Decode(&roles); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().AddRealmRoleMappings(r.Context(), realm, userID, roles)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) ListGroups(w http.ResponseWriter, r *http.Request, realm string) {
	groups, err := s.kc().ListGroups(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, groups)
}

func (s *Server) ListIdentityProviders(w http.ResponseWriter, r *http.Request, realm string) {
	idps, err := s.kc().ListIdentityProviders(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, idps)
}

func (s *Server) CreateIdentityProvider(w http.ResponseWriter, r *http.Request, realm string) {
	var body keycloak.IdentityProvider
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeKCError(w, http.StatusBadRequest, "invalid JSON", nil)
		return
	}
	code, raw, err := s.kc().CreateIdentityProvider(r.Context(), realm, body)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	if code >= 300 {
		writeKCError(w, code, "keycloak error", raw)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *Server) ListClientScopes(w http.ResponseWriter, r *http.Request, realm string) {
	scopes, err := s.kc().ListClientScopes(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, scopes)
}

func (s *Server) ListEvents(w http.ResponseWriter, r *http.Request, realm string) {
	events, err := s.kc().ListAdminEvents(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, events)
}

func (s *Server) ListKeys(w http.ResponseWriter, r *http.Request, realm string) {
	keys, err := s.kc().ListKeys(r.Context(), realm)
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, http.StatusOK, keys)
}

func (s *Server) ListAllClients(w http.ResponseWriter, r *http.Request) {
	realms, err := s.kc().ListRealms(r.Context())
	if err != nil {
		writeKCError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	type clientWithRealm struct {
		keycloak.Client
		Realm string `json:"realm"`
	}
	var all []clientWithRealm
	for _, rl := range realms {
		if rl.Realm == "master" {
			continue
		}
		clients, err := s.kc().ListClients(r.Context(), rl.Realm)
		if err != nil {
			continue
		}
		for _, c := range clients {
			all = append(all, clientWithRealm{Client: c, Realm: rl.Realm})
		}
	}
	writeJSON(w, http.StatusOK, all)
}

// Package httpapi holds the HTTP routes of the PulseChat API.
package httpapi

import (
	"encoding/json"
	"net/http"
)

// NewRouter returns the root handler. Add your routes here (see ASSIGNMENT.md).
func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", health)
	return mux
}

func health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

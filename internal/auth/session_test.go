// Copyright 2026 Zyvor AI Labs
// SPDX-License-Identifier: Apache-2.0

package auth

import (
	"testing"
)

func TestLabDemoEnabledOptIn(t *testing.T) {
	t.Setenv("HAVEN_LAB_LOGIN", "")
	if LabDemoEnabled() {
		t.Fatal("empty HAVEN_LAB_LOGIN must disable lab demo")
	}
	for _, v := range []string{"1", "true", "YES"} {
		t.Setenv("HAVEN_LAB_LOGIN", v)
		if !LabDemoEnabled() {
			t.Fatalf("%q should enable lab demo", v)
		}
	}
	t.Setenv("HAVEN_LAB_LOGIN", "0")
	if LabDemoEnabled() {
		t.Fatal("0 must disable lab demo")
	}
}

func TestMatchLabDemo(t *testing.T) {
	t.Setenv("HAVEN_LAB_LOGIN", "")
	if MatchLabDemo("demo", "demo") {
		t.Fatal("lab match must fail when disabled")
	}
	t.Setenv("HAVEN_LAB_LOGIN", "1")
	if !MatchLabDemo("demo", "demo") {
		t.Fatal("expected demo/demo to match when enabled")
	}
	if MatchLabDemo("admin", "admin") {
		t.Fatal("non-demo creds must not match lab")
	}
}

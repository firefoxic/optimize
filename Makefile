export PATH := ./node_modules/.bin:$(PATH)

help: ## 🧾 Print this message
	$(call print_help)
.PHONY: help

check: ## ✅ Check types with TypeScript
	@tsc --noEmit
.PHONY: check

lint: ## 🧬 Lint code by oxlint
	@oxlint
.PHONY: lint

fix: ## 🩹 Fix code by oxlint
	@oxlint --fix
.PHONY: fix

test: ## 🧪 Run tests
	@vitest run
.PHONY: test

test-watch: ## 👁️ Run tests in watch mode
	@vitest watch
.PHONY: test-watch

test-coverage: ## 📊 Run tests with coverage report
	@vitest run --coverage
.PHONY: test-coverage

test-ui: ## 🧪 Run tests with UI
	@vitest --ui
.PHONY: test-ui

build: lint test ## 🏗️ Build the project
	@tsdown && rm dist/bin/cli.d.ts
.PHONY: build

release: build ## 🚀 Release a new version
	@pnpm dlx @firefoxic/release-it
.PHONY: release

ANSI_RESET := \033[0m
ANSI_BOLD := \033[1m
ANSI_BOLD_CYAN := \033[1;36m

define print_help
	@printf "\n\t📜 $(ANSI_BOLD)Available targets:$(ANSI_RESET)\n\n"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) \
	| awk -F ':|##' '\
	BEGIN { \
		ANSI_BOLD_CYAN = "$(ANSI_BOLD_CYAN)"; \
		ANSI_RESET = "$(ANSI_RESET)"; \
	} \
	{ \
		targets[NR]=$$1; descs[NR]=$$3; \
		if (length($$1) > max) max = length($$1); \
	} \
	END { \
		for (i = 1; i <= NR; i++) { \
			printf "\t%s%" max "s%s —%s\n", ANSI_BOLD_CYAN, targets[i], ANSI_RESET, descs[i]; \
		} \
		printf "\n" \
	}'
endef

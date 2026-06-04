/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular imports make module boundaries hard to reason about.",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "domain-does-not-import-ui",
      severity: "error",
      comment: "Domain code must stay pure and independent from presentation.",
      from: {
        path: "^src/modules/[^/]+/domain/",
      },
      to: {
        path: "^src/(components|modules/[^/]+/ui)/",
      },
    },
    {
      name: "domain-does-not-import-react-or-next",
      severity: "error",
      comment: "Domain code must not depend on React or Next runtime APIs.",
      from: {
        path: "^src/modules/[^/]+/domain/",
      },
      to: {
        path: "^(react|react-dom|next)(/|$)",
      },
    },
    {
      name: "domain-does-not-import-supabase",
      severity: "error",
      comment: "Domain code must not depend on Supabase clients or generated DB types.",
      from: {
        path: "^src/modules/[^/]+/domain/",
      },
      to: {
        path: "^(@supabase/|src/lib/supabase/|src/types/database)",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    exclude: {
      path: "^(node_modules|\\.next|coverage|playwright-report|test-results)/",
    },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
      conditionNames: ["import", "require", "node", "default"],
      exportsFields: ["exports"],
    },
    tsConfig: {
      fileName: "tsconfig.json",
    },
    tsPreCompilationDeps: true,
  },
}

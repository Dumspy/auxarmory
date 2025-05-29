{
  description = "Nodejs 22";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        devShells = {
          default = pkgs.mkShell rec {
            packages = with pkgs; [
              nodejs_22
              corepack_22
              openssl
            ];

            shellHook = with pkgs; ''
              export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine"
              export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
              export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
              export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
            '';
          };
        };
      }
    );
}

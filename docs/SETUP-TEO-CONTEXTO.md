# Setup da fonte `teo-contexto`

## Local

Tenha um clone autenticado de `TeoZ08/teo-contexto` ao lado deste repositório e gere o snapshot:

```sh
npm run sync:teo-contexto -- --source ../teo-contexto --output public/data/teo-contexto.snapshot.json
```

Revise o diff do JSON antes de commitá-lo. O script lê `main` diretamente, mesmo que o clone esteja com outra branch ativa.

## GitHub Actions

Opcionalmente, crie o secret de repositório `TEO_CONTEXTO_READ_TOKEN` com acesso mínimo de leitura a `TeoZ08/teo-contexto`. O workflow faz checkout da fonte somente se o secret existir; em qualquer outra situação usa o snapshot commitado. Não criar token de browser, variável Vite ou secret no repositório.

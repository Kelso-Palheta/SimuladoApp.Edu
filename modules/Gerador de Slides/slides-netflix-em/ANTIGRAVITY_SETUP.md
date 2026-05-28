# Antigravity IDE — Integração da Skill slides-netflix-em

## Passos para ativar a skill no Antigravity

### 1. Verificar caminho da skill
A skill está localizada em:
```
~/.claude/skills/slides-netflix-em/
```

### 2. Registrar skill no Antigravity

**Opção A: Via arquivo de configuração (se Antigravity suportar)**

Se Antigravity usar arquivo `skills.json` ou similar em `~/.antigravity/`:
```json
{
  "skills": [
    {
      "id": "slides-netflix-em",
      "path": "~/.claude/skills/slides-netflix-em",
      "enabled": true,
      "commands": ["/slides-em", "/slides-netflix-em"]
    }
  ]
}
```

**Opção B: Via Claude Code (dentro do Antigravity)**

1. Abrir Antigravity
2. Invocar Claude (Cmd+K ou similar)
3. Digitar: `/slides-em` ou `/slides-netflix-em`
4. Se aparecer mensagem de skill not found, carregar manualmente:
   - Copiar caminho: `/Users/kelsopalheta/.claude/skills/slides-netflix-em`
   - Usar: `/skill-load /Users/kelsopalheta/.claude/skills/slides-netflix-em`

### 3. Ativar skill

Após registrar, usar a skill:
```
/slides-em PDF sobre Origens do Samba para 1º ano, 90 minutos
```

Ou com arquivo:
```
/slides-netflix-em Baseie-se nesse PDF para gerar slides sobre [TEMA]
```

## Estrutura da skill registrada

```
slides-netflix-em/
├── SKILL.md                      (descrição e instruções)
├── ANTIGRAVITY_SETUP.md          (este arquivo)
├── antigravity.manifest.json     (metadados)
├── assets/
│   └── template_base.html        (Reveal.js template)
├── scripts/
│   ├── gerador.py               (versão original)
│   └── gerador_v2.py            (com efeitos Netflix)
├── references/
│   ├── banco_midia.md
│   ├── visual_spec.md
│   └── modos_input.md
└── examples/
    └── exemplo_aula.html
```

## Troubleshooting

### Problema: Skill não aparece no Antigravity

**Solução:**
1. Verificar se `.claude/skills` está no `$PATH` do Antigravity
2. Restart Antigravity completamente
3. Tentar `/skill-list` para listar skills carregadas
4. Se não listar, tentar `/skill-load` manualmente

### Problema: "/" não funciona como trigger

**Solução:**
- Antigravity pode usar sintaxe diferente (ex: `#slides-em` ou `!slides-em`)
- Consultar documentação do Antigravity sobre triggers de skills/comandos
- Como fallback, sempre funciona: `gere slides para...` (ativa automaticamente)

### Problema: Skill não gera output corretamente

**Solução:**
1. Verificar se gerador_v2.py está com permissão de execução:
   ```bash
   chmod +x ~/.claude/skills/slides-netflix-em/scripts/gerador_v2.py
   ```

2. Verificar se template_base.html existe e é acessível
3. Tentar chamar skill com input completo:
   ```
   /slides-em
   materia: História
   serie: 1º Ano
   duracao: 50
   ```

## Output esperado

Ao invocar a skill com sucesso:
1. **Arquivo HTML** gerado: `aula_<materia>_<tema>.html`
2. **Tamanho**: ~60KB (completo com Reveal.js CDN links)
3. **Visualização**: Abrir no navegador
   ```bash
   open aula_origensdobsamba_1ano.html
   ```

4. **Recursos**: 
   - Animações CSS glow-pulse e slide-in
   - Videos background em loop (Mixkit)
   - Quiz interativo
   - Speaker notes por slide
   - Glossário interativo

## Próximos passos

Se Antigravity não reconhecer a skill:
1. Checar documentação oficial do Antigravity sobre custom skills/extensions
2. Tentar registrar como VS Code extension (se Antigravity for VS Code-based)
3. Contatar Antigravity support se formulário de registro não existir

## Referência rápida

| Comando | Resultado |
|---------|-----------|
| `/slides-em` | Ativa skill (exigir inputs) |
| `/slides-netflix-em` | Alias para `/slides-em` |
| `gere slides para...` | Ativa automaticamente |
| `/skill-list` | Lista todas as skills |
| `/skill-load <path>` | Carrega skill manualmente |

---

**Skill Author**: Kelso Palheta  
**Versão**: 1.0.0  
**Atualizado**: 2026-05-13
